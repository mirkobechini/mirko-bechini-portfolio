<?php

namespace App\GithubSync;

use App\Enums\SyncFrequency;
use App\Models\Setting;
use Carbon\CarbonImmutable;

/**
 * Impostazioni e stato della sincronizzazione con GitHub (salvate nella tabella settings).
 */
class SyncSettings
{
    private const FREQUENCY = 'github_sync.frequency';

    private const LAST_SUCCESS = 'github_sync.last_success_at';

    private const LAST_RUN = 'github_sync.last_run';

    public function frequency(): SyncFrequency
    {
        return SyncFrequency::tryFrom((string) Setting::get(self::FREQUENCY)) ?? SyncFrequency::Weekly;
    }

    public function setFrequency(SyncFrequency $frequency): void
    {
        Setting::put(self::FREQUENCY, $frequency->value);
    }

    public function lastSuccessAt(): ?CarbonImmutable
    {
        $value = Setting::get(self::LAST_SUCCESS);

        return $value === null ? null : CarbonImmutable::parse($value);
    }

    public function isDue(): bool
    {
        return $this->frequency()->isDue($this->lastSuccessAt(), CarbonImmutable::now());
    }

    public function recordSuccess(SyncResult $result): void
    {
        $now = CarbonImmutable::now();

        Setting::put(self::LAST_SUCCESS, $now->toIso8601String());
        Setting::put(self::LAST_RUN, [
            'at' => $now->toIso8601String(),
            'ok' => true,
            'message' => $result->summary(),
        ]);
    }

    public function recordFailure(string $message): void
    {
        Setting::put(self::LAST_RUN, [
            'at' => CarbonImmutable::now()->toIso8601String(),
            'ok' => false,
            'message' => $message,
        ]);
    }

    /**
     * Ultimo tentativo (riuscito o no), per mostrarlo nel pannello.
     *
     * @return array{at: CarbonImmutable, ok: bool, message: string}|null
     */
    public function lastRun(): ?array
    {
        $run = Setting::get(self::LAST_RUN);

        if (! is_array($run)) {
            return null;
        }

        return [
            'at' => CarbonImmutable::parse($run['at']),
            'ok' => (bool) $run['ok'],
            'message' => (string) $run['message'],
        ];
    }
}
