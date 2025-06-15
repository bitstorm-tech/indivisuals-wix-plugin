<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prompt extends Model
{
    protected $fillable = [
        'name',
        'category',
        'prompt',
        'active',
        'example_image',
        'example_image_mime_type',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $hidden = [
        'example_image', // Hide binary data from JSON responses by default
    ];

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function hasExampleImage(): bool
    {
        return ! empty($this->example_image);
    }

    public function getExampleImageDataUri(): ?string
    {
        if (! $this->hasExampleImage()) {
            return null;
        }

        $base64 = base64_encode($this->example_image);

        return "data:{$this->example_image_mime_type};base64,{$base64}";
    }

    public function setExampleImageFromFile($file): void
    {
        if ($file) {
            $this->example_image = file_get_contents($file->getRealPath());
            $this->example_image_mime_type = $file->getMimeType();
        } else {
            $this->example_image = null;
            $this->example_image_mime_type = null;
        }
    }

    public function setExampleImageFromData(string $imageData, string $mimeType): void
    {
        $this->example_image = $imageData;
        $this->example_image_mime_type = $mimeType;
    }
}
