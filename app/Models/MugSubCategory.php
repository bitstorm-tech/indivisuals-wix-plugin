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

    public function category()
    {
        return $this->belongsTo(MugCategory::class, 'category_id');
    }

    public function mugs()
    {
        return $this->hasMany(Mug::class, 'subcategory_id');
    }
}
