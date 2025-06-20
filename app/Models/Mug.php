<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mug extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id',
        'subcategory_id',
        'image_path',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'status' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(MugCategory::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(MugSubCategory::class, 'subcategory_id');
    }

    public function getImageUrl(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        return route('image.show', ['filename' => basename($this->image_path)]);
    }
}
