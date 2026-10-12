<?php

namespace App\Http\Resources;

use App\Models\Skill;
use App\Support\TechnologyList;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Una skill nella forma che usa la libreria del sito (skillsData.js).
 *
 * @mixin Skill
 */
class PublicSkillResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'skill' => $this->name,
            'icon' => $this->icon,
            'category' => $this->category,
            'color' => $this->color,
            'functions' => $this->functions ?? [],
            // Titoli dei progetti visibili collegati + testo libero, senza doppioni
            'relatedProjects' => TechnologyList::merge(
                $this->projects->pluck('title')->all(),
                $this->extra_projects ?? [],
            ),
        ];
    }
}
