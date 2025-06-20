<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MugSubCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category_id',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(MugCategory::class, 'category_id');
    }

    public function mugs()
    {
        return $this->hasMany(Mug::class, 'subcategory_id');
    }

    protected static function booted()
    {
        static::deleting(function ($subcategory) {
            if ($subcategory->is_default) {
                throw new \Exception('Cannot delete default subcategory');
            }
        });
    }
}
