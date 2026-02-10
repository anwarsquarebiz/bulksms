<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactGroupController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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
