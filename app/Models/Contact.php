<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone_number',
        'email',
        'tags',
        'status',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    /**
     * Groups this contact belongs to.
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(ContactGroup::class)->withTimestamps();
    }
}


