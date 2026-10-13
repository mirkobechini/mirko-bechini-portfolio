<?php

namespace Tests\Unit;

use App\Enums\SyncFrequency;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class SyncFrequencyTest extends TestCase
{
    private CarbonImmutable $now;

    protected function setUp(): void
    {
        $this->now = CarbonImmutable::parse('2026-10-12 12:00:00');
    }

    public function test_the_offered_frequencies_and_their_intervals(): void
    {
        $this->assertSame(['manual', 'daily', 'weekly', 'biweekly', 'monthly'], array_column(SyncFrequency::cases(), 'value'));
        $this->assertSame([null, 1, 7, 14, 30], array_map(fn (SyncFrequency $f) => $f->days(), SyncFrequency::cases()));
    }

    public function test_every_frequency_has_an_italian_label(): void
    {
        $this->assertSame('Ogni settimana', SyncFrequency::Weekly->getLabel());
        $this->assertSame('Ogni 2 settimane', SyncFrequency::Biweekly->getLabel());
        $this->assertSame('Solo manuale', SyncFrequency::Manual->getLabel());
    }

    public function test_manual_is_never_due(): void
    {
        $this->assertFalse(SyncFrequency::Manual->isDue(null, $this->now));
        $this->assertFalse(SyncFrequency::Manual->isDue($this->now->subYears(5), $this->now));
    }

    public function test_it_is_due_when_it_never_ran(): void
    {
        foreach ([SyncFrequency::Daily, SyncFrequency::Weekly, SyncFrequency::Biweekly, SyncFrequency::Monthly] as $frequency) {
            $this->assertTrue($frequency->isDue(null, $this->now), $frequency->value);
        }
    }

    #[DataProvider('boundaries')]
    public function test_the_due_boundary(SyncFrequency $frequency, int $daysAgo, int $hoursOffset, bool $expected): void
    {
        $last = $this->now->subDays($daysAgo)->addHours($hoursOffset);

        $this->assertSame($expected, $frequency->isDue($last, $this->now));
    }

    /**
     * @return array<string, array{SyncFrequency, int, int, bool}>
     */
    public static function boundaries(): array
    {
        return [
            'giornaliera, 23 ore fa' => [SyncFrequency::Daily, 1, 1, false],
            'giornaliera, 24 ore fa' => [SyncFrequency::Daily, 1, 0, true],
            'settimanale, 6 giorni fa' => [SyncFrequency::Weekly, 6, 0, false],
            'settimanale, 7 giorni meno un ora' => [SyncFrequency::Weekly, 7, 1, false],
            'settimanale, 7 giorni esatti' => [SyncFrequency::Weekly, 7, 0, true],
            'settimanale, 20 giorni fa' => [SyncFrequency::Weekly, 20, 0, true],
            'ogni 2 settimane, 13 giorni fa' => [SyncFrequency::Biweekly, 13, 0, false],
            'ogni 2 settimane, 14 giorni fa' => [SyncFrequency::Biweekly, 14, 0, true],
            'mensile, 29 giorni fa' => [SyncFrequency::Monthly, 29, 0, false],
            'mensile, 30 giorni fa' => [SyncFrequency::Monthly, 30, 0, true],
        ];
    }
}
