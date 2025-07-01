<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mug extends Model
{
    protected $fillable = [
        'name',
        'description_long',
        'description_short',
        'height_mm',
        'diameter_mm',
        'print_template_width_mm',
        'print_template_height_mm',
        'filling_quantity',
        'dishwasher_safe',
        'price',
        'category_id',
        'subcategory_id',
        'image',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'dishwasher_safe' => 'boolean',
    ];

    /**
     * Set the price attribute (converts from dollars to cents)
     */
    public function setPriceAttribute($value): void
    {
        $this->attributes['price'] = (int) round($value * 100);
    }

    /**
     * Get the price attribute (converts from cents to dollars)
     */
    public function getPriceAttribute($value): float
    {
        return $value / 100;
    }

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
        if (! $this->image) {
            return null;
        }

        return asset('storage/mugs/'.$this->image);
    }
}
