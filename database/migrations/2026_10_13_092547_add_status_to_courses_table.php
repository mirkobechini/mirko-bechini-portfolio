<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `status` è il valore dell'enum CourseStatus (inProgress, onHold, done). I corsi già presenti partono
     * da una stima: se il periodo dice "current" o "in corso" sono in corso, altrimenti completati. Si
     * correggono poi dal pannello.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('status')->default('done')->after('period');
        });

        DB::table('courses')->select('id', 'period')->get()->each(function (object $course): void {
            if (preg_match('/current|in corso|ongoing/i', (string) $course->period) === 1) {
                DB::table('courses')->where('id', $course->id)->update(['status' => 'inProgress']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
