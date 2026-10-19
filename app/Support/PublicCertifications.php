<?php

namespace App\Support;

use App\Enums\CourseStatus;
use App\Http\Resources\PublicCertificationResource;
use App\Models\Certification;
use App\Models\Course;
use Illuminate\Support\Facades\Cache;

/**
 * Gli attestati come li vede il sito pubblico (non nascosti, in ordine, più quelli dei corsi), in cache. Vedi PublicCache per
 * l'invalidazione.
 */
class PublicCertifications
{
    public const CACHE_KEY = 'api.certifications.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $certifications = Certification::query()->visible()->inDisplayOrder()->get();

            return ['data' => [
                ...PublicCertificationResource::collection($certifications)->resolve(),
                ...self::fromCourses(),
            ]];
        });
    }

    /**
     * Gli attestati dei corsi, nella forma delle certificazioni: così quello caricato nel corso compare
     * anche in galleria senza rifarlo in /admin/certifications.
     *
     * Un corso conta solo se è visibile, COMPLETATO (un attestato esiste a corso finito: uno in corso o in
     * sospeso non ne ha) e ha un attestato. Se esiste già una certificazione collegata a quel corso (anche
     * nascosta: nasconderla è una scelta) vale quella e il corso non si ripete.
     *
     * @return list<array<string, mixed>>
     */
    private static function fromCourses(): array
    {
        $alreadyListed = Certification::query()->whereNotNull('course_id')->pluck('course_id');

        return Course::query()
            ->visible()
            ->where('status', CourseStatus::Completed->value)
            ->whereNotIn('id', $alreadyListed)
            ->where(fn ($query) => $query->whereNotNull('certificate_upload')->orWhere(fn ($q) => $q->whereNotNull('certificate')->where('certificate', '!=', '')))
            ->inDisplayOrder()
            ->get()
            ->map(fn (Course $course): array => [
                // Testo, non numero: non si confonde con l'id di una certificazione
                'id' => 'course-'.$course->id,
                'title' => 'Attestato del corso '.$course->course,
                'preview' => $course->certificateUrl(),
                'previewWidth' => $course->certificate_width,
                'previewHeight' => $course->certificate_height,
                'link' => null,
                'organization' => $course->organization,
                'organizationUrl' => $course->organization_url ?? '',
                'skills' => $course->skills ?? [],
                'courseId' => $course->id,
            ])
            ->all();
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
