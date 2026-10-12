<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            // Percorso dell'icona dentro public/assets (es. /modals/skills/icons/html.webp): l'upload arriverà dopo.
            $table->string('icon')->nullable();
            $table->string('category');
            $table->string('color', 7)->default('#000000');
            $table->json('functions')->nullable();
            // Progetti che non esistono nella tabella projects (es. "Tutti i progetti"): testo libero.
            $table->json('extra_projects')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('hidden')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
