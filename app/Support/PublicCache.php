<?php

namespace App\Support;

/**
 * Le risposte pubbliche si influenzano a vicenda (un progetto compare nelle skill e nei corsi, un corso
 * nei progetti): a ogni modifica si svuotano tutte. Costa una query in più alla richiesta successiva.
 */
class PublicCache
{
    public static function forgetAll(): void
    {
        PublicProjects::forget();
        PublicSkills::forget();
        PublicCourses::forget();
    }
}
