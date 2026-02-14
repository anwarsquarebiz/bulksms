<?php

namespace App\Http\Controllers;

use App\Models\SmsMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    /**
     * Display the Inbox - inbound SMS messages from all providers.
     */
    public function index(Request $request): Response
    {
        $messages = SmsMessage::with(['provider'])
            ->where('direction', 'inbound')
            ->latest('received_at')
            ->when($request->get('provider'), function ($q, $provider) {
                $q->whereHas('provider', fn ($q) => $q->where('name', $provider));
            })
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('inbox/index', [
            'messages' => $messages,
            'webhookUrls' => [
                'telnyx' => route('webhooks.telnyx', [], true),
                'twilio' => route('webhooks.twilio', [], true),
                'signalwire' => route('webhooks.signalwire', [], true),
            ],
        ]);
    }
}
