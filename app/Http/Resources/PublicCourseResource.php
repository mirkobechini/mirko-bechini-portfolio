<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un corso nella forma che usa il libro "Formazione" (educationData.js), più i progetti collegati.
 *
 * @mixin Course
 */
class PublicCourseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course' => $this->course,
            'description' => $this->description,
            'certificate' => $this->certificateUrl() ?? '',
            'organization' => $this->organization,
            'organizationUrl' => $this->organization_url ?? '',
            'period' => $this->period,
            'skills' => $this->skills ?? [],
            'highlights' => $this->highlights ?? [],
            'modules' => collect($this->modules ?? [])->map(fn (array $module): array => [
                'title' => $module['title'] ?? '',
                'description' => $module['description'] ?? '',
                'skillsModules' => $module['skills'] ?? [],
            ])->all(),
            'projects' => $this->projects->pluck('title')->all(),
        ];
    }
}
