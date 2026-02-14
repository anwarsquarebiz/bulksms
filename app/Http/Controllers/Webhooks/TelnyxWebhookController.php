<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Telnyx Incoming SMS Webhook
 *
 * @see https://developers.telnyx.com/docs/messaging/messages/receiving-webhooks
 *
 * Event types: message.received (inbound), message.sent, message.finalized
 * Payload: data.event_type, data.payload.from.phone_number, data.payload.to[].phone_number,
 *          data.payload.text, data.payload.id, data.payload.media, data.payload.received_at
 */
class TelnyxWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $rawPayload = $request->getContent();
        $signature = $request->header('telnyx-signature-ed25519');
        $timestamp = $request->header('telnyx-timestamp');

        // Verify signature if public key is configured
        $publicKey = config('services.telnyx.public_key');
        if ($publicKey && $signature && $timestamp && !$this->verifySignature($rawPayload, $signature, $timestamp, $publicKey)) {
            Log::warning('Telnyx webhook signature verification failed');
            return response('Invalid signature', 403);
        }

        $data = $request->json('data', []);
        $eventType = $data['event_type'] ?? null;
        $payload = $data['payload'] ?? [];

        if ($eventType === 'message.received') {
            $this->handleInboundMessage($payload);
        }
        // message.sent and message.finalized can be used for delivery status updates (optional)

        return response('', 200);
    }

    protected function handleInboundMessage(array $payload): void
    {
        $provider = SmsProvider::where('name', 'telnyx')->first();
        if (!$provider) {
            Log::warning('Telnyx provider not found for inbound message');
            return;
        }

        $from = $payload['from']['phone_number'] ?? null;
        $to = $payload['to'][0]['phone_number'] ?? $payload['to'][0] ?? null;
        $text = $payload['text'] ?? '';
        $messageId = $payload['id'] ?? null;
        $receivedAt = $payload['received_at'] ?? null;
        $media = $payload['media'] ?? [];

        if (!$from || !$to) {
            Log::warning('Telnyx inbound: missing from or to', $payload);
            return;
        }

        // Normalize to - array for multiple recipients
        if (is_array($to)) {
            $to = $to['phone_number'] ?? $to[0] ?? '';
        }

        $metadata = [];
        if (!empty($media)) {
            $metadata['media'] = array_map(fn ($m) => [
                'url' => $m['url'] ?? null,
                'content_type' => $m['content_type'] ?? null,
                'size' => $m['size'] ?? null,
            ], $media);
        }

        SmsMessage::create([
            'user_id' => null,
            'provider_id' => $provider->id,
            'direction' => 'inbound',
            'to' => $to,
            'from' => $from,
            'message' => $text,
            'status' => 'delivered',
            'provider_message_id' => $messageId,
            'metadata' => $metadata,
            'received_at' => $receivedAt ? \Carbon\Carbon::parse($receivedAt) : now(),
        ]);
    }

    protected function verifySignature(string $payload, string $signature, string $timestamp, string $publicKeyBase64): bool
    {
        if (!extension_loaded('sodium')) {
            return true; // Skip if sodium not available
        }

        $publicKey = base64_decode($publicKeyBase64);
        if ($publicKey === false || strlen($publicKey) !== SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES) {
            return false;
        }

        $signedPayload = $timestamp . '|' . $payload;
        $signatureBytes = base64_decode($signature);
        if ($signatureBytes === false) {
            return false;
        }

        return sodium_crypto_sign_verify_detached($signatureBytes, $signedPayload, $publicKey);
    }
}
