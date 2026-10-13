<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formation_steps', function (Blueprint $table) {
            $table->id();
            // Valore dell'enum FormationStepKind: colonna "Focus attuale" o "Roadmap"
            $table->string('kind');
            $table->string('title');
            $table->text('description');
            // Valore dell'enum FormationStepStatus
            $table->string('status');
            // Etichetta breve sotto la scheda (es. "New Skill", "Portfolio")
            $table->string('badge')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('hidden')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formation_steps');
    }
};
