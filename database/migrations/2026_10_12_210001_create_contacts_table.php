<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            // mailto:, tel: oppure http(s):// (controllato dal pannello)
            $table->string('href');
            // Emoji mostrata sulla card
            $table->string('icon', 16);
            $table->string('aria_label');
            // Valore dell'enum ContactVariant (colore del bordo)
            $table->string('variant')->default('other');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('hidden')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
