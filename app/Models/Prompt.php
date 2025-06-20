<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Prompt extends Model
{
    protected $fillable = [
        'name',
        'category_id',
        'subcategory_id',
        'prompt',
        'active',
        'example_image_filename',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(PromptCategory::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(PromptSubCategory::class, 'subcategory_id');
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeBySubcategory($query, $subcategoryId)
    {
        return $query->where('subcategory_id', $subcategoryId);
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
