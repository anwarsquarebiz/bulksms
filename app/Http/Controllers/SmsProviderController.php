<?php

namespace App\Http\Controllers;

use App\Models\SmsProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SmsProviderController extends Controller
{
    public function index()
    {
        $providers = SmsProvider::orderBy('priority')->get();

        return Inertia::render('sms-providers/index', [
            'providers' => $providers,
        ]);
    }

    public function edit(SmsProvider $smsProvider)
    {
        return Inertia::render('sms-providers/edit', [
            'provider' => $smsProvider,
        ]);
    }

    public function update(Request $request, SmsProvider $smsProvider)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'priority' => 'integer|min:0',
        ]);

        // Validate credentials based on provider type
        $credentials = [];
        $credInput = $request->input('credentials', []);
        
        switch ($smsProvider->name) {
            case 'telnyx':
                $request->validate([
                    'credentials' => 'required|array',
                    'credentials.api_key' => 'required|string',
                    'credentials.messaging_profile_id' => 'nullable|string',
                    'credentials.from_number' => 'nullable|string',
                ]);
                $credentials = [
                    'api_key' => $credInput['api_key'] ?? '',
                    'messaging_profile_id' => $credInput['messaging_profile_id'] ?? '',
                    'from_number' => $credInput['from_number'] ?? '',
                ];
                break;

            case 'twilio':
                $request->validate([
                    'credentials' => 'required|array',
                    'credentials.account_sid' => 'required|string',
                    'credentials.auth_token' => 'required|string',
                    'credentials.from_number' => 'nullable|string',
                ]);
                $credentials = [
                    'account_sid' => $credInput['account_sid'] ?? '',
                    'auth_token' => $credInput['auth_token'] ?? '',
                    'from_number' => $credInput['from_number'] ?? '',
                ];
                break;

            case 'signalwire':
                $request->validate([
                    'credentials' => 'required|array',
                    'credentials.project_id' => 'required|string',
                    'credentials.api_token' => 'required|string',
                    'credentials.space_url' => 'required|string',
                    'credentials.from_number' => 'nullable|string',
                ]);
                $credentials = [
                    'project_id' => $credInput['project_id'] ?? '',
                    'api_token' => $credInput['api_token'] ?? '',
                    'space_url' => $credInput['space_url'] ?? '',
                    'from_number' => $credInput['from_number'] ?? '',
                ];
                break;
        }

        // If setting as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            SmsProvider::where('id', '!=', $smsProvider->id)
                ->update(['is_default' => false]);
        }

        $smsProvider->update([
            'display_name' => $validated['display_name'],
            'is_active' => $validated['is_active'] ?? false,
            'is_default' => $validated['is_default'] ?? false,
            'priority' => $validated['priority'] ?? 0,
            'credentials' => $credentials,
        ]);

        return redirect()->route('sms-providers.index')
            ->with('success', 'Provider updated successfully');
    }
}

