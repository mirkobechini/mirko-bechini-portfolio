<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le colonne *_upload contengono il percorso di un file caricato dal pannello (disco degli upload) e
     * hanno la precedenza sul percorso/URL scritto a mano nella colonna accanto.
     */
    public function up(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            // L'immagine può ora arrivare dal caricamento: l'indirizzo scritto a mano diventa facoltativo.
            $table->string('preview')->nullable()->change();
            $table->string('preview_upload')->nullable()->after('preview');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->string('certificate_upload')->nullable()->after('certificate');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('preview_upload')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('preview_upload');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('certificate_upload');
        });

        Schema::table('certifications', function (Blueprint $table) {
            $table->dropColumn('preview_upload');
            $table->string('preview')->nullable(false)->change();
        });
    }
};
