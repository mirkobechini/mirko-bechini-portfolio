<?php

namespace App\Support;

/**
 * Elenchi di tecnologie (linguaggio, topics, tecnologie aggiuntive): una voce sola anche se cambiano
 * le maiuscole ("JavaScript" e "javascript"), con il primo ordine di apparizione.
 */
final class TechnologyList
{
    /**
     * @param  array<int, mixed>  ...$lists
     * @return list<string>
     */
    public static function merge(array ...$lists): array
    {
        $seen = [];
        $merged = [];

        foreach ($lists as $list) {
            foreach ($list as $technology) {
                if (! is_string($technology) || trim($technology) === '') {
                    continue;
                }

                $key = mb_strtolower(trim($technology));

                if (! isset($seen[$key])) {
                    $seen[$key] = true;
                    $merged[] = trim($technology);
                }
            }
        }

        return $merged;
    }
}
