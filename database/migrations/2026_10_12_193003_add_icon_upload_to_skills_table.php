<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skills', function (Blueprint $table) {
            // Icona caricata dal pannello: percorso sul disco degli upload (config filesystems.uploads_disk).
            // Ha la precedenza su `icon`, che resta il percorso predefinito dentro public/assets.
            $table->string('icon_upload')->nullable()->after('icon');
        });
    }

    public function down(): void
    {
        Schema::table('skills', function (Blueprint $table) {
            $table->dropColumn('icon_upload');
        });
    }
};
