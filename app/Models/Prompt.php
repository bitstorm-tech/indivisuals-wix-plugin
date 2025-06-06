<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prompt extends Model
{
    protected $fillable = [
        'name',
        'category',
        'prompt',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
