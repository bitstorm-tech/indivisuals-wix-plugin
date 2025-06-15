<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Prompt extends Model
{
    protected $fillable = [
        'name',
        'category',
        'prompt',
        'active',
        'example_image_filename',
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

    public function getExampleImageUrl(): ?string
    {
        if (! $this->example_image_filename) {
            return null;
        }

        return asset('storage/example-images/'.$this->example_image_filename);
    }

    public function deleteExampleImageFile(): void
    {
        if ($this->example_image_filename) {
            Storage::disk('public')->delete('example-images/'.$this->example_image_filename);
        }
    }
}
