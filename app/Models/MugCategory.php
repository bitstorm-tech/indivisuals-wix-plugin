<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MugCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function mugs()
    {
        return $this->hasMany(Mug::class, 'category_id');
    }

    public function subcategories()
    {
        return $this->hasMany(MugSubCategory::class, 'category_id');
    }

    protected static function booted()
    {
        static::deleting(function ($category) {
            if ($category->is_default) {
                throw new \Exception('Cannot delete default category');
            }
        });
    }
}
