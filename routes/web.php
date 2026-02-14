<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactGroupController;
use App\Http\Controllers\Webhooks\SignalWireWebhookController;
use App\Http\Controllers\Webhooks\TelnyxWebhookController;
use App\Http\Controllers\Webhooks\TwilioWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Webhooks - must be public (no auth) for provider callbacks
Route::prefix('webhooks')->name('webhooks.')->group(function () {
    Route::post('telnyx', [TelnyxWebhookController::class, 'handle'])->name('telnyx');
    Route::post('twilio', [TwilioWebhookController::class, 'handle'])->name('twilio');
    Route::post('signalwire', [SignalWireWebhookController::class, 'handle'])->name('signalwire');
});

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('contacts', ContactController::class)->except(['show']);
    Route::get('contacts-import', [ContactController::class, 'importForm'])->name('contacts.import.form');
    Route::post('contacts-import', [ContactController::class, 'import'])->name('contacts.import');

    Route::resource('contact-groups', ContactGroupController::class)->except(['show']);

    Route::get('inbox', [\App\Http\Controllers\InboxController::class, 'index'])->name('inbox.index');

    Route::prefix('sms')->name('sms.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SmsController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\SmsController::class, 'create'])->name('create');
        Route::post('/send-single', [\App\Http\Controllers\SmsController::class, 'sendSingle'])->name('send-single');
        Route::post('/send-bulk', [\App\Http\Controllers\SmsController::class, 'sendBulk'])->name('send-bulk');
    });

    Route::resource('campaigns', \App\Http\Controllers\CampaignController::class)->except(['edit', 'update', 'destroy']);
    Route::get('campaigns/{campaign}', [\App\Http\Controllers\CampaignController::class, 'show'])->name('campaigns.show');

    Route::resource('sms-templates', \App\Http\Controllers\SmsTemplateController::class);

    Route::get('reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');

    Route::resource('sms-providers', \App\Http\Controllers\SmsProviderController::class)->only(['index', 'edit', 'update']);
});

require __DIR__.'/settings.php';
