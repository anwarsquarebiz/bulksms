<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SmsMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'campaign_id',
        'contact_id',
        'provider_id',
        'direction',
        'to',
        'from',
        'message',
        'is_unicode',
        'status',
        'provider_message_id',
        'error_message',
        'cost',
        'metadata',
        'sent_at',
        'delivered_at',
        'received_at',
    ];

    protected $casts = [
        'is_unicode' => 'bool',
        'cost' => 'decimal:4',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(SmsProvider::class, 'provider_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}

