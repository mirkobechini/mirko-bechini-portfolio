<?php

namespace App\Http\Resources;

use App\Models\Project;
use App\Support\TechnologyList;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un progetto come lo riceve il sito React.
 *
 * I nomi dei campi (`projectScope`, `updatedAt`, `repo`, `live`...) sono quelli che il frontend usa già
 * (vedi projectMapper.js), così le card e i filtri non cambiano. NON si espongono: i progetti nascosti,
 * gli appunti dei raggruppamenti, le date interne di sincronizzazione.
 *
 * @mixin Project
 */
class PublicProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->github_repo,
            'title' => $this->title,
            'description' => $this->description_it ?? '',
            'projectScope' => $this->scope->value,
            'type' => $this->type->value,
            'technologies' => TechnologyList::merge($this->technologies ?? [], $this->extra_technologies ?? []),
            'repo' => $this->repo_url,
            'live' => $this->live_url,
            'stars' => $this->stars,
            'updatedAt' => $this->pushed_at?->toIso8601String(),
            'pinned' => $this->pinned,
            'course' => $this->course?->course,
            'group' => $this->group === null ? null : [
                'id' => $this->group->id,
                'name' => $this->group->name,
            ],
        ];
    }
}
