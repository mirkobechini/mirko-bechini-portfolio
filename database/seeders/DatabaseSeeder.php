<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Niente utente di prova: l'amministratore si crea da comando (con 2FA), mai da un seeder,
     * altrimenti `db:seed` in produzione lascerebbe un account noto.
     */
    public function run(): void
    {
        $this->call(ProjectSeeder::class);
        $this->call(SkillSeeder::class);
        $this->call(CourseSeeder::class);
        $this->call(CertificationSeeder::class);
        $this->call(ContactSeeder::class);
        $this->call(FormationStepSeeder::class);
    }
}
