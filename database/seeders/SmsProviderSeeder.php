<?php

namespace Database\Seeders;

use App\Models\SmsProvider;
use Illuminate\Database\Seeder;

class SmsProviderSeeder extends Seeder
{
    public function run(): void
    {
        SmsProvider::updateOrCreate(
            ['name' => 'telnyx'],
            [
                'display_name' => 'Telnyx',
                'is_active' => true,
                'is_default' => true,
                'priority' => 1,
                'credentials' => [
                    'api_key' => env('TELNYX_API_KEY', ''),
                    'messaging_profile_id' => env('TELNYX_MESSAGING_PROFILE_ID', ''),
                ],
            ]
        );

        SmsProvider::updateOrCreate(
            ['name' => 'twilio'],
            [
                'display_name' => 'Twilio',
                'is_active' => true,
                'is_default' => false,
                'priority' => 2,
                'credentials' => [
                    'account_sid' => env('TWILIO_ACCOUNT_SID', ''),
                    'auth_token' => env('TWILIO_AUTH_TOKEN', ''),
                    'from_number' => env('TWILIO_FROM_NUMBER', ''),
                ],
            ]
        );

        SmsProvider::updateOrCreate(
            ['name' => 'signalwire'],
            [
                'display_name' => 'SignalWire',
                'is_active' => true,
                'is_default' => false,
                'priority' => 3,
                'credentials' => [
                    'project_id' => env('SIGNALWIRE_PROJECT_ID', ''),
                    'api_token' => env('SIGNALWIRE_API_TOKEN', ''),
                    'space_url' => env('SIGNALWIRE_SPACE_URL', ''),
                ],
            ]
        );
    }
}
