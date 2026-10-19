<?php

namespace App\Support;

use App\Enums\CourseStatus;
use App\Models\Certification;
use App\Models\Course;

/**
 * Tiene allineate le certificazioni "dal corso" (`from_course`) con i corsi: segnare un corso come
 * Completato con un attestato crea una vera certificazione nell'elenco del pannello (che si può nascondere,
 * rinominare e riordinare); la voce segue il corso finché esiste e vale, poi sparisce.
 *
 * Regole:
 * - Una voce esiste solo per un corso visibile, Completato e con un attestato.
 * - Se il corso ha già una certificazione scritta a mano (anche nascosta) quella vale e la voce automatica
 *   non esiste: nascondere una certificazione è una scelta, non va aggirata.
 * - Ad ogni salvataggio del corso la voce riprende dal corso immagine, dimensioni, ente e skill; il titolo,
 *   la posizione e "nascosta" restano come li hai messi tu.
 * - Se il corso smette di valere (riaperto, attestato tolto, nascosto, eliminato) la voce viene eliminata.
 */
class CourseCertificateSync
{
    public static function sync(Course $course): void
    {
        $linked = Certification::query()->where('course_id', $course->id);
        $automatic = (clone $linked)->where('from_course', true)->first();
        $hasManual = (clone $linked)->where('from_course', false)->exists();

        $url = $course->certificateUrl();
        $qualifies = ! $course->hidden
            && $course->status === CourseStatus::Completed
            && filled($url)
            && ! $hasManual;

        if (! $qualifies) {
            $automatic?->delete();

            return;
        }

        $fromCourse = [
            'preview' => $url,
            'preview_upload' => null, // l'immagine è del corso: due record non devono contendersi lo stesso file
            'preview_width' => $course->certificate_width,
            'preview_height' => $course->certificate_height,
            'organization' => $course->organization,
            'organization_url' => $course->organization_url,
            'skills' => $course->skills ?? [],
        ];

        if ($automatic !== null) {
            $automatic->update($fromCourse);

            return;
        }

        Certification::create($fromCourse + [
            'title' => 'Attestato del corso '.$course->course,
            'course_id' => $course->id,
            'from_course' => true,
            'position' => (int) Certification::query()->max('position') + 1, // in fondo
            'hidden' => false,
        ]);
    }

    public static function forCourseId(?int $courseId): void
    {
        $course = $courseId === null ? null : Course::query()->find($courseId);

        if ($course !== null) {
            self::sync($course);
        }
    }

    public static function syncAll(): void
    {
        Course::query()->each(fn (Course $course) => self::sync($course));
    }
}
