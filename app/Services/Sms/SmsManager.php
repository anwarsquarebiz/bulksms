<?php

namespace App\Services\Sms;

use App\Models\Campaign;
use App\Models\SmsMessage;
use App\Models\SmsProvider;
use Illuminate\Support\Collection;

class SmsManager
{
    protected static array $providerCache = [];

    /**
     * Select provider based on campaign routing strategy
     */
    public static function selectProvider(SmsMessage $message, ?Campaign $campaign = null): ?SmsProvider
    {
        if (!$campaign && $message->campaign_id) {
            $campaign = $message->campaign;
        }

        if (!$campaign) {
            // Single SMS - use default or first active provider
            return SmsProvider::where('is_active', true)
                ->where('is_default', true)
                ->first() ?? SmsProvider::where('is_active', true)->first();
        }

        return match ($campaign->routing_strategy) {
            'single' => self::selectSingleProvider($campaign),
            'distribute' => self::selectDistributedProvider($campaign),
            'failover' => self::selectFailoverProvider($campaign),
            default => self::selectSingleProvider($campaign),
        };
    }

    protected static function selectSingleProvider(Campaign $campaign): ?SmsProvider
    {
        if ($campaign->provider_id) {
            $provider = SmsProvider::find($campaign->provider_id);
            if ($provider && $provider->is_active) {
                return $provider;
            }
        }

        return SmsProvider::where('is_active', true)
            ->where('is_default', true)
            ->first() ?? SmsProvider::where('is_active', true)->first();
    }

    protected static function selectDistributedProvider(Campaign $campaign): ?SmsProvider
    {
        $distribution = $campaign->provider_distribution ?? [];
        if (empty($distribution)) {
            return self::selectSingleProvider($campaign);
        }

        // Get total messages sent for this campaign to calculate distribution
        $totalSent = $campaign->sent_count;
        $activeProviders = SmsProvider::whereIn('id', array_keys($distribution))
            ->where('is_active', true)
            ->get();

        if ($activeProviders->isEmpty()) {
            return self::selectSingleProvider($campaign);
        }

        // Calculate which provider should handle this message based on percentage
        $random = mt_rand(1, 100);
        $cumulative = 0;

        foreach ($distribution as $providerId => $percentage) {
            $cumulative += $percentage;
            if ($random <= $cumulative) {
                $provider = $activeProviders->firstWhere('id', $providerId);
                if ($provider) {
                    return $provider;
                }
            }
        }

        // Fallback to first active provider
        return $activeProviders->first();
    }

    protected static function selectFailoverProvider(Campaign $campaign): ?SmsProvider
    {
        $failoverOrder = $campaign->provider_failover_order ?? [];
        if (empty($failoverOrder)) {
            return self::selectSingleProvider($campaign);
        }

        foreach ($failoverOrder as $providerId) {
            $provider = SmsProvider::find($providerId);
            if ($provider && $provider->is_active) {
                return $provider;
            }
        }

        return self::selectSingleProvider($campaign);
    }

    /**
     * Get next provider for failover retry
     */
    public static function getFailoverProvider(SmsProvider $failedProvider, SmsMessage $message): ?SmsProvider
    {
        $campaign = $message->campaign;
        if (!$campaign || $campaign->routing_strategy !== 'failover') {
            // For non-failover campaigns, try other active providers
            return SmsProvider::where('is_active', true)
                ->where('id', '!=', $failedProvider->id)
                ->orderBy('priority', 'desc')
                ->first();
        }

        $failoverOrder = $campaign->provider_failover_order ?? [];
        $currentIndex = array_search($failedProvider->id, $failoverOrder);

        if ($currentIndex === false || $currentIndex === count($failoverOrder) - 1) {
            return null; // No more providers to try
        }

        $nextProviderId = $failoverOrder[$currentIndex + 1];
        $provider = SmsProvider::find($nextProviderId);

        return ($provider && $provider->is_active) ? $provider : null;
    }

    /**
     * Send SMS using the selected provider
     */
    public function send(SmsMessage $message, SmsProvider $provider): array
    {
        $service = SmsServiceFactory::make($provider);

        return $service->send(
            $message->to,
            $message->message,
            $message->from,
            $message->is_unicode
        );
    }

    /**
     * Get all active providers
     */
    public static function getActiveProviders(): Collection
    {
        return SmsProvider::where('is_active', true)
            ->orderBy('priority', 'desc')
            ->orderBy('name')
            ->get();
    }
}

