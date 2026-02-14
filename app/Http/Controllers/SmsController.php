<?php

namespace App\Http\Controllers;

use App\Jobs\SendSmsJob;
use App\Models\Contact;
use App\Models\ContactGroup;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use App\Services\Sms\SmsManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SmsController extends Controller
{
    public function index()
    {
        $messages = SmsMessage::with(['provider', 'user'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return Inertia::render('sms/index', [
            'messages' => $messages,
        ]);
    }

    public function create()
    {
        $providers = SmsProvider::where('is_active', true)->get();
        $groups = ContactGroup::withCount('contacts')->get();

        return Inertia::render('sms/create', [
            'providers' => $providers,
            'groups' => $groups,
        ]);
    }

    public function sendSingle(Request $request)
    {
        $validated = $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:1600',
            'sender_id' => 'nullable|string|max:11',
            'is_unicode' => 'boolean',
            'provider_id' => 'required|exists:sms_providers,id',
        ]);

        $provider = SmsProvider::findOrFail($validated['provider_id']);

        try {
            $message = SmsMessage::create([
                'user_id' => auth()->id(),
                'provider_id' => $provider->id,
                'to' => $validated['to'],
                'from' => $validated['sender_id'] ?? null,
                'message' => $validated['message'],
                'is_unicode' => $validated['is_unicode'] ?? false,
                'status' => 'pending',
            ]);

            // Queue the job instead of sending directly
            SendSmsJob::dispatch($message, $provider->id);

            return redirect()->route('sms.index')
                ->with('success', 'SMS queued for sending');
        } catch (\Exception $e) {
            Log::error('SMS queue error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to queue SMS: ' . $e->getMessage()]);
        }
    }

    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1600',
            'sender_id' => 'nullable|string|max:11',
            'is_unicode' => 'boolean',
            'provider_id' => 'required|exists:sms_providers,id',
            'group_ids' => 'nullable|array',
            'group_ids.*' => 'exists:contact_groups,id',
            'phone_numbers' => 'nullable|string',
        ]);

        $provider = SmsProvider::findOrFail($validated['provider_id']);

        $recipients = [];
    

        // Get recipients from groups
        if (!empty($validated['group_ids'])) {
            $groups = ContactGroup::whereIn('id', $validated['group_ids'])
                ->with('contacts')
                ->get();

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
        }
        
        // Add manual phone numbers
        if (!empty($validated['phone_numbers'])) {
            $manualNumbers = array_filter(
                array_map('trim', explode("\n", $validated['phone_numbers']))
            );

            foreach ($manualNumbers as $phone) {
                if (preg_match('/^\+?[1-9]\d{1,14}$/', $phone)) {
                    // Try to find contact by phone number
                    $contact = Contact::where('phone_number', $phone)->first();
                    $recipients[] = [
                        'phone' => $phone,
                        'name' => $contact?->name,
                        'contact_id' => $contact?->id,
                    ];
                }
            }
        }

        // Remove duplicates
        $recipients = collect($recipients)->unique('phone')->values()->all();

        if (empty($recipients)) {
            return back()->withErrors(['error' => 'No valid recipients found']);
        }

        $successCount = 0;
        $failCount = 0;

        DB::beginTransaction();

        try {
            foreach ($recipients as $recipient) {
                $message = SmsMessage::create([
                    'user_id' => auth()->id(),
                    'provider_id' => $provider->id,
                    'contact_id' => $recipient['contact_id'] ?? null,
                    'to' => $recipient['phone'],
                    'from' => $validated['sender_id'] ?? null,
                    'message' => $validated['message'],
                    'is_unicode' => $validated['is_unicode'] ?? false,
                    'status' => 'pending',
                ]);

                // Queue the job
                SendSmsJob::dispatch($message, $provider->id);
            }

            DB::commit();

            return redirect()->route('sms.index')
                ->with('success', "Bulk SMS queued: " . count($recipients) . " messages");
        } catch (\Exception $e) {
            Log::error('Failed to queue bulk SMS: ' . $e->getMessage());
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to queue bulk SMS: ' . $e->getMessage()]);
        }
    }
}

