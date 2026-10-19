<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Larghezza e altezza dell'attestato caricato per un corso: servono alla galleria Certificazioni, dove il
     * sito riserva lo spazio dell'immagine prima che sia scaricata. Le calcola il modello a ogni caricamento.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedSmallInteger('certificate_width')->nullable()->after('certificate_upload');
            $table->unsignedSmallInteger('certificate_height')->nullable()->after('certificate_width');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['certificate_width', 'certificate_height']);
        });
    }
};
