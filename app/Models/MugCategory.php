<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MugCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function mugs()
    {
        return $this->hasMany(Mug::class, 'category_id');
    }

    public function subcategories()
    {
        return $this->hasMany(MugSubCategory::class, 'category_id');
    }
}
