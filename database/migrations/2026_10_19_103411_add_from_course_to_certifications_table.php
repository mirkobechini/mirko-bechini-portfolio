<?php

use App\Models\Course;
use App\Support\CourseCertificateSync;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `from_course` segna le certificazioni create e tenute aggiornate in automatico da un corso completato con
     * un attestato (vedi App\Support\CourseCertificateSync): compaiono nell'elenco di /admin/certifications
     * come le altre. Quelle scritte a mano restano `false`.
     */
    public function up(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->boolean('from_course')->default(false)->after('course_id');
        });

        // I corsi già completati con un attestato: salvarli rilegge le dimensioni dell'immagine e crea la voce.
        Course::query()->each(fn (Course $course) => $course->save());
        CourseCertificateSync::syncAll();
    }

    public function down(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->dropColumn('from_course');
        });
    }
};
