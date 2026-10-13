<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('course');
            $table->text('description');
            // URL dell'attestato oppure percorso in public/assets (es. /modals/certifications/x.webp)
            $table->string('certificate')->nullable();
            $table->string('organization');
            $table->string('organization_url')->nullable();
            // Testo libero come nel sito: "05/2025 - 02/2026", "03/2026 - current"
            $table->string('period');
            // Nomi delle skill (tabella skills): cliccandole il sito apre la skill
            $table->json('skills')->nullable();
            $table->json('highlights')->nullable();
            // [{ title, description, skills: [nomi] }]
            $table->json('modules')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('hidden')->default(false);
            $table->timestamps();
        });

        Schema::table('projects', function (Blueprint $table) {
            // Il corso per cui è stato fatto il progetto; se il corso viene eliminato il progetto resta.
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('course_id');
        });

        Schema::dropIfExists('courses');
    }
};
