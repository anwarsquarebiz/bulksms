<?php

namespace App\Http\Controllers;

use App\Jobs\SendSmsJob;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\ContactGroup;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use App\Models\SmsTemplate;
use App\Services\Sms\SmsManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::with(['provider', 'groups'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return Inertia::render('campaigns/index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create()
    {
        $providers = SmsProvider::where('is_active', true)->get();
        $groups = ContactGroup::withCount('contacts')->get();
        $templates = SmsTemplate::where('user_id', auth()->id())->get();

        return Inertia::render('campaigns/create', [
            'providers' => $providers,
            'groups' => $groups,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'message' => 'required|string|max:1600',
            'sender_id' => 'nullable|string|max:11',
            'is_unicode' => 'boolean',
            'template_id' => 'nullable|exists:sms_templates,id',
            'routing_strategy' => 'required|in:single,distribute,failover',
            'provider_id' => 'required_if:routing_strategy,single|exists:sms_providers,id',
            'provider_distribution' => 'required_if:routing_strategy,distribute|array',
            'provider_failover_order' => 'required_if:routing_strategy,failover|array',
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'exists:contact_groups,id',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        DB::beginTransaction();
        try {
            $campaign = Campaign::create([
                'user_id' => auth()->id(),
                'template_id' => $validated['template_id'] ?? null,
                'name' => $validated['name'],
                'message' => $validated['message'],
                'sender_id' => $validated['sender_id'] ?? null,
                'is_unicode' => $validated['is_unicode'] ?? false,
                'routing_strategy' => $validated['routing_strategy'],
                'provider_id' => $validated['provider_id'] ?? null,
                'provider_distribution' => $validated['provider_distribution'] ?? null,
                'provider_failover_order' => $validated['provider_failover_order'] ?? null,
                'status' => $validated['scheduled_at'] ? 'scheduled' : 'draft',
                'scheduled_at' => $validated['scheduled_at'] ?? null,
            ]);

            $campaign->groups()->attach($validated['group_ids']);

            // Get all recipients
            $groups = ContactGroup::whereIn('id', $validated['group_ids'])
                ->with('contacts')
                ->get();

            $recipients = [];
            foreach ($groups as $group) {
                foreach ($group->contacts as $contact) {
                    if ($contact->status === 'active') {
                        $recipients[] = [
                            'phone' => $contact->phone_number,
                            'name' => $contact->name,
                            'contact_id' => $contact->id,
                        ];
                    }
                }
            }

            // Remove duplicates
            $recipients = collect($recipients)->unique('phone')->values()->all();
            $campaign->update(['total_recipients' => count($recipients)]);

            // Create message records and queue jobs
            foreach ($recipients as $recipient) {
                $message = SmsMessage::create([
                    'user_id' => auth()->id(),
                    'campaign_id' => $campaign->id,
                    'contact_id' => $recipient['contact_id'],
                    'to' => $recipient['phone'],
                    'from' => $validated['sender_id'] ?? null,
                    'message' => $validated['message'],
                    'is_unicode' => $validated['is_unicode'] ?? false,
                    'status' => 'pending',
                ]);

                if (!$validated['scheduled_at']) {
                    // Queue immediately
                    SendSmsJob::dispatch($message);
                } else {
                    // Schedule for later
                    SendSmsJob::dispatch($message)->delay($validated['scheduled_at']);
                }
            }

            DB::commit();

            if ($validated['scheduled_at']) {
                $campaign->update(['status' => 'scheduled']);
                return redirect()->route('campaigns.index')
                    ->with('success', 'Campaign scheduled successfully');
            }

            $campaign->update(['status' => 'sending', 'started_at' => now()]);
            return redirect()->route('campaigns.index')
                ->with('success', 'Campaign started successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create campaign: ' . $e->getMessage()]);
        }
    }

    public function show(Campaign $campaign)
    {
        $campaign->load(['provider', 'groups', 'messages.provider', 'template']);

        return Inertia::render('campaigns/show', [
            'campaign' => $campaign,
        ]);
    }
}

