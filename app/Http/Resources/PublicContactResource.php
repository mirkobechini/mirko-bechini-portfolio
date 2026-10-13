<?php

namespace App\Http\Resources;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un contatto nella forma che usa la finestra dei contatti (contactsData.js).
 *
 * @mixin Contact
 */
class PublicContactResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'href' => $this->href,
            'icon' => $this->icon,
            'label' => $this->label,
            'variantClass' => $this->variant->value,
            'ariaLabel' => $this->aria_label,
        ];
    }
}
