<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = SmsMessage::with(['provider', 'campaign', 'contact'])
            ->where('user_id', auth()->id());

        // Filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('campaign_id')) {
            $query->where('campaign_id', $request->campaign_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }

        $messages = $query->latest()->paginate(50)->withQueryString();

        $campaigns = Campaign::where('user_id', auth()->id())
            ->orderBy('name')
            ->get(['id', 'name']);

        $providers = SmsProvider::where('is_active', true)
            ->orderBy('display_name')
            ->get(['id', 'display_name']);

        // Statistics
        $stats = [
            'total' => SmsMessage::where('user_id', auth()->id())->count(),
            'sent' => SmsMessage::where('user_id', auth()->id())
                ->where('status', 'sent')
                ->count(),
            'delivered' => SmsMessage::where('user_id', auth()->id())
                ->where('status', 'delivered')
                ->count(),
            'failed' => SmsMessage::where('user_id', auth()->id())
                ->where('status', 'failed')
                ->count(),
        ];

        $stats['delivery_rate'] = $stats['sent'] > 0
            ? round(($stats['delivered'] / $stats['sent']) * 100, 2)
            : 0;

        return Inertia::render('reports/index', [
            'messages' => $messages,
            'campaigns' => $campaigns,
            'providers' => $providers,
            'stats' => $stats,
            'filters' => $request->only(['date_from', 'date_to', 'campaign_id', 'status', 'provider_id']),
        ]);
    }
}

