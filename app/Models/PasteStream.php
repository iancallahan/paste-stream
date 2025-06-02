<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class PasteStream extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'pastes',
        'public',
        'uuid',
        'default',
    ];

    protected $casts = [
        'pastes' => 'array',
    ];
}
