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
        return $this->hasMany(Prompt::class);
    }
}
