<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Contact;
use App\Models\ContactGroup;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // SMS Statistics
        $totalSms = SmsMessage::where('user_id', $userId)->count();
        $sentSms = SmsMessage::where('user_id', $userId)
            ->where('status', 'sent')
            ->count();
        $deliveredSms = SmsMessage::where('user_id', $userId)
            ->where('status', 'delivered')
            ->count();
        $failedSms = SmsMessage::where('user_id', $userId)
            ->where('status', 'failed')
            ->count();

        $deliveryRate = $sentSms > 0
            ? round(($deliveredSms / $sentSms) * 100, 2)
            : 0;

        // Campaign Statistics
        $activeCampaigns = Campaign::where('user_id', $userId)
            ->whereIn('status', ['scheduled', 'sending'])
            ->count();

        $totalCampaigns = Campaign::where('user_id', $userId)->count();

        // Provider Usage Statistics
        $providerStats = SmsMessage::where('user_id', $userId)
            ->whereNotNull('provider_id')
            ->selectRaw('provider_id, COUNT(*) as total, SUM(CASE WHEN status = "sent" THEN 1 ELSE 0 END) as sent, SUM(CASE WHEN status = "delivered" THEN 1 ELSE 0 END) as delivered, SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
            ->groupBy('provider_id')
            ->get()
            ->map(function ($stat) {
                $provider = SmsProvider::find($stat->provider_id);
                return [
                    'provider' => $provider ? $provider->display_name : 'Unknown',
                    'total' => $stat->total,
                    'sent' => $stat->sent,
                    'delivered' => $stat->delivered,
                    'failed' => $stat->failed,
                ];
            });

        // Recent Messages
        $recentMessages = SmsMessage::where('user_id', $userId)
            ->with(['provider', 'campaign'])
            ->latest()
            ->limit(10)
            ->get();

        // Recent Campaigns
        $recentCampaigns = Campaign::where('user_id', $userId)
            ->with(['provider'])
            ->latest()
            ->limit(5)
            ->get();

        // Contact Statistics (contacts are global for the company, not per-user)
        $totalContacts = Contact::count();
        $activeContacts = Contact::where('status', 'active')->count();
        $totalGroups = ContactGroup::count();

        return Inertia::render('dashboard', [
            'stats' => [
                'sms' => [
                    'total' => $totalSms,
                    'sent' => $sentSms,
                    'delivered' => $deliveredSms,
                    'failed' => $failedSms,
                    'delivery_rate' => $deliveryRate,
                ],
                'campaigns' => [
                    'total' => $totalCampaigns,
                    'active' => $activeCampaigns,
                ],
                'contacts' => [
                    'total' => $totalContacts,
                    'active' => $activeContacts,
                    'groups' => $totalGroups,
                ],
            ],
            'providerStats' => $providerStats,
            'recentMessages' => $recentMessages,
            'recentCampaigns' => $recentCampaigns,
        ]);
    }
}

