<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Twilio Incoming SMS Webhook
 *
 * @see https://www.twilio.com/docs/messaging/guides/webhook-request
 *
 * Request: application/x-www-form-urlencoded
 * Parameters: MessageSid, From, To, Body, NumMedia, MediaUrl0, MediaContentType0, etc.
 * Response: Must return TwiML (text/xml) - empty <Response/> to acknowledge without replying
 */
class TwilioWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $url = $request->fullUrl();
        $params = $request->all();
        $signature = $request->header('X-Twilio-Signature');

        $provider = SmsProvider::where('name', 'twilio')->first();
        if (!$provider) {
            Log::warning('Twilio provider not found for inbound message');
            return $this->emptyTwiML();
        }

        $authToken = $provider->credentials['auth_token'] ?? null;
        if ($authToken && $signature && !$this->validateTwilioSignature($url, $params, $signature, $authToken)) {
            Log::warning('Twilio webhook signature verification failed');
            return response('Invalid signature', 403);
        }

        $messageSid = $request->input('MessageSid');
        $from = $request->input('From');
        $to = $request->input('To');
        $body = $request->input('Body', '');
        $numMedia = (int) ($request->input('NumMedia', 0));

        if (!$from || !$to) {
            Log::warning('Twilio inbound: missing From or To', $request->all());
            return $this->emptyTwiML();
        }

        $metadata = [];
        if ($numMedia > 0) {
            for ($i = 0; $i < $numMedia; $i++) {
                $metadata['media'][] = [
                    'url' => $request->input("MediaUrl{$i}"),
                    'content_type' => $request->input("MediaContentType{$i}"),
                ];
            }
        }

        SmsMessage::create([
            'user_id' => null,
            'provider_id' => $provider->id,
            'direction' => 'inbound',
            'to' => $to,
            'from' => $from,
            'message' => $body,
            'status' => 'delivered',
            'provider_message_id' => $messageSid,
            'metadata' => $metadata,
            'received_at' => now(),
        ]);

        return $this->emptyTwiML();
    }

    protected function emptyTwiML(): Response
    {
        return response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', 200, [
            'Content-Type' => 'text/xml',
        ]);
    }

    protected function validateTwilioSignature(string $url, array $params, string $signature, string $authToken): bool
    {
        ksort($params);
        $data = $url;
        foreach ($params as $key => $value) {
            $data .= $key . $value;
        }
        $expected = base64_encode(hash_hmac('sha1', $data, $authToken, true));
        return hash_equals($expected, $signature);
    }
}
