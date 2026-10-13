<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Chi può entrare nel pannello. Non è assegnabile in massa: si abilita a mano (vedi README).
            $table->boolean('is_admin')->default(false);

            // Autenticazione a due fattori con app (Filament): segreto e codici di recupero, cifrati dal modello.
            $table->text('app_authentication_secret')->nullable();
            $table->text('app_authentication_recovery_codes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_admin', 'app_authentication_secret', 'app_authentication_recovery_codes']);
        });
    }
};
