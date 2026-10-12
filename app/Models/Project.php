<?php

namespace App\Models;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'github_repo',
        'title',
        'description_it',
        'type',
        'scope',
        'technologies',
        'extra_technologies',
        'repo_url',
        'live_url',
        'stars',
        'pushed_at',
        'pinned',
        'hidden',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => ProjectType::class,
            'scope' => ProjectScope::class,
            'technologies' => 'array',
            'extra_technologies' => 'array',
            'pinned' => 'boolean',
            'hidden' => 'boolean',
            'pushed_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }
}
