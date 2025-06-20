<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromptSubCategory extends Model
{
    protected $fillable = [
        'name',
    ];

    public function prompts()
    {
        return $this->hasMany(Prompt::class);
    }
}
