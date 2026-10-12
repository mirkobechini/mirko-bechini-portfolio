<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

/**
 * Importa i contatti di partenza (quelli che stavano in contactsData.js).
 *
 * Come gli altri seeder usa firstOrCreate (per etichetta) e non sovrascrive le modifiche fatte dal pannello.
 */
class ContactSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = json_decode(
            file_get_contents(database_path('seeders/data/contacts.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($contacts as $data) {
            Contact::firstOrCreate(['label' => $data['label']], $data);
        }
    }
}
