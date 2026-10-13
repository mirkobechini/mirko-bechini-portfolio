<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `started_at` è l'inizio del corso letto dal testo del periodo ("05/2025 - 02/2026"): serve a mostrare
     * i corsi dal più recente al più vecchio. Lo aggiorna da solo il modello a ogni salvataggio.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->date('started_at')->nullable()->after('period')->index();
        });

        // I corsi già presenti: stessa lettura del periodo che fa il modello (App\Models\Course).
        DB::table('courses')->select('id', 'period')->get()->each(function (object $course): void {
            if (preg_match('/(?:(\d{1,2})\/)?(\d{4})/', (string) $course->period, $m) !== 1) {
                return;
            }

            $month = $m[1] === '' ? 1 : (int) $m[1];

            if ($month < 1 || $month > 12) {
                return;
            }

            DB::table('courses')->where('id', $course->id)->update([
                'started_at' => sprintf('%04d-%02d-01', (int) $m[2], $month),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('started_at');
        });
    }
};
