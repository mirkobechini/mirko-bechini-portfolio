<?php

namespace Tests\Unit;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use PHPUnit\Framework\TestCase;

class ProjectEnumsTest extends TestCase
{
    public function test_the_project_types_are_the_three_known_ones(): void
    {
        $this->assertSame(['frontend', 'backend', 'fullstack'], array_column(ProjectType::cases(), 'value'));
    }

    public function test_the_project_scopes_are_personal_and_work(): void
    {
        $this->assertSame(['personal', 'work'], array_column(ProjectScope::cases(), 'value'));
    }

    public function test_every_case_has_an_italian_label_and_a_colour(): void
    {
        foreach ([...ProjectType::cases(), ...ProjectScope::cases()] as $case) {
            $this->assertNotSame('', $case->getLabel());
            $this->assertNotSame('', $case->getColor());
        }

        $this->assertSame('Lavoro', ProjectScope::Work->getLabel());
        $this->assertSame('Personale', ProjectScope::Personal->getLabel());
    }

    public function test_unknown_values_are_rejected(): void
    {
        $this->assertNull(ProjectType::tryFrom('frontendd'));
        $this->assertNull(ProjectScope::tryFrom('boh'));
    }

    /**
     * Il sito React ha un'icona e un'etichetta per ogni valore (useProjectFilters.js): se si aggiunge o
     * si rinomina un caso qui senza aggiornare il sito, il filtro dei progetti smette di funzionare.
     */
    public function test_the_values_match_what_the_react_filters_expect(): void
    {
        $js = file_get_contents(dirname(__DIR__, 2).'/resources/js/src/features/modals/projects/hooks/useProjectFilters.js');

        foreach ([...ProjectType::cases(), ...ProjectScope::cases()] as $case) {
            $this->assertStringContainsString("value: '{$case->value}'", $js, "Il filtro React non conosce il valore [{$case->value}]");
        }

        // ... e viceversa: il sito non deve avere valori che qui non esistono (oltre a 'all')
        preg_match_all("/value: '([a-z]+)'/", $js, $matches);
        $known = array_merge(['all'], array_column(ProjectType::cases(), 'value'), array_column(ProjectScope::cases(), 'value'));
        $this->assertSame([], array_values(array_diff(array_unique($matches[1]), $known)));
    }
}
