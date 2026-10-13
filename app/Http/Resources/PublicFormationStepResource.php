<?php

namespace App\Http\Resources;

use App\Models\FormationStep;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un passo del percorso nella forma che usa il libro Formazione (formationFocus / formationRoadmap),
 * con `kind` per dire in quale colonna va.
 *
 * @mixin FormationStep
 */
class PublicFormationStepResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind->value,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status->value,
            'badge' => $this->badge,
        ];
    }
}
