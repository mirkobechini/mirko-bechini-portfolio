<?php

namespace App\Http\Resources;

use App\Models\Certification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un attestato nella forma che usa la galleria (certificationData.js), più il corso collegato.
 *
 * @mixin Certification
 */
class PublicCertificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'preview' => $this->previewUrl(),
            'previewWidth' => $this->preview_width,
            'previewHeight' => $this->preview_height,
            'link' => $this->link,
            'organization' => $this->organization,
            'organizationUrl' => $this->organization_url ?? '',
            'skills' => $this->skills ?? [],
            // Id del corso: il sito lo usa per aprire il corso giusto, non l'id dell'attestato
            'courseId' => $this->course_id,
        ];
    }
}
