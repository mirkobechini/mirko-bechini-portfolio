<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            // URL dell'immagine oppure percorso in public/assets (es. /modals/certifications/x.webp)
            $table->string('preview');
            $table->unsignedSmallInteger('preview_width')->nullable();
            $table->unsignedSmallInteger('preview_height')->nullable();
            // Pagina di verifica dell'attestato, se esiste
            $table->string('link')->nullable();
            $table->string('organization');
            $table->string('organization_url')->nullable();
            $table->json('skills')->nullable();
            // Il corso a cui si riferisce: cliccando l'attestato il sito apre quel corso.
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('hidden')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certifications');
    }
};
