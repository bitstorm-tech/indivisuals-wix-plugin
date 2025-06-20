<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromptCategory extends Model
{
    protected $fillable = [
        'name',
    ];

    public function prompts()
    {
        return $this->hasMany(Prompt::class, 'category_id');
    }

    public function subcategories()
    {
        return $this->hasMany(PromptSubCategory::class, 'category_id');
    }
}
