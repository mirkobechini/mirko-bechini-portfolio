<?php

namespace Tests\Unit;

use App\Support\TechnologyList;
use PHPUnit\Framework\TestCase;

class TechnologyListTest extends TestCase
{
    public function test_it_merges_lists_keeping_the_first_spelling_and_order(): void
    {
        $this->assertSame(
            ['JavaScript', 'react', 'AI', 'Figma'],
            TechnologyList::merge(['JavaScript', 'react'], ['javascript', 'REACT', 'AI'], ['Figma', 'ai'])
        );
    }

    public function test_it_ignores_empty_and_non_string_values(): void
    {
        $this->assertSame(['PHP'], TechnologyList::merge([null, '', '  ', 42, 'PHP', false]));
    }

    public function test_it_trims_the_values(): void
    {
        $this->assertSame(['Laravel'], TechnologyList::merge([' Laravel '], ['laravel']));
    }

    public function test_no_lists_means_an_empty_list(): void
    {
        $this->assertSame([], TechnologyList::merge());
        $this->assertSame([], TechnologyList::merge([], []));
    }
}
