<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromptSubCategory extends Model
{
    protected $fillable = [
        'name',
        'category_id',
    ];

    public function category()
    {
        return $this->belongsTo(PromptCategory::class, 'category_id');
    }

    public function prompts()
    {
        return $this->hasMany(Prompt::class, 'subcategory_id');
    }
}
