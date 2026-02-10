<?php

namespace App\Jobs;

use App\Models\SmsMessage;
use App\Models\SmsProvider;
use App\Services\Sms\SmsManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120]; // Retry after 30s, 60s, 120s

    public function __construct(
        public SmsMessage $message,
        public ?int $providerId = null,
    ) {}

    public function handle(SmsManager $smsManager): void
    {
        try {
            $provider = $this->providerId
                ? SmsProvider::find($this->providerId)
                : \App\Services\Sms\SmsManager::selectProvider($this->message);

            if (!$provider || !$provider->is_active) {
                throw new \Exception('No active provider available');
            }

            $result = $smsManager->send(
                $this->message,
                $provider
            );

            if ($result['success']) {
                $this->message->update([
                    'status' => 'sent',
                    'provider_message_id' => $result['message_id'] ?? null,
                    'metadata' => $result['response'] ?? null,
                    'sent_at' => now(),
                ]);

                // Update campaign stats if applicable
                if ($this->message->campaign_id) {
                    $this->message->campaign->increment('sent_count');
                }
            } else {
                // Try failover if enabled
                if ($this->attempts() < $this->tries) {
                    $nextProvider = \App\Services\Sms\SmsManager::getFailoverProvider($provider, $this->message);
                    if ($nextProvider) {
                        $this->providerId = $nextProvider->id;
                        $this->release(30); // Retry with next provider after 30 seconds
                        return;
                    }
                }

                $this->message->update([
                    'status' => 'failed',
                    'error_message' => $result['error'] ?? 'Unknown error',
                ]);

                if ($this->message->campaign_id) {
                    $this->message->campaign->increment('failed_count');
                }

                throw new \Exception($result['error'] ?? 'Failed to send SMS');
            }
        } catch (\Exception $e) {
            Log::error('SendSmsJob failed', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            if ($this->attempts() >= $this->tries) {
                $this->message->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);

                if ($this->message->campaign_id) {
                    $this->message->campaign->increment('failed_count');
                }
            } else {
                throw $e; // Retry
            }
        }
    }
}

