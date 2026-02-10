<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'is_active',
        'is_default',
        'priority',
        'credentials',
    ];

    protected $casts = [
        'is_active' => 'bool',
        'is_default' => 'bool',
        'credentials' => 'array',
    ];

    public function messages()
    {
        return $this->hasMany(SmsMessage::class, 'provider_id');
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'provider_id');
    }
}

