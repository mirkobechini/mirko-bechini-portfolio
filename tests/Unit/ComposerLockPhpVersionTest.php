<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Evita che un `composer update` fatto su un PHP più recente di quello dichiarato
 * porti nel lock pacchetti che richiedono una versione di PHP superiore al minimo
 * supportato (finirebbe per bloccare l'app a runtime con "Composer detected issues
 * in your platform" su CI o produzione).
 */
class ComposerLockPhpVersionTest extends TestCase
{
    public function test_locked_packages_do_not_require_a_newer_php_than_composer_json(): void
    {
        $root = dirname(__DIR__, 2);
        $composer = json_decode(file_get_contents($root.'/composer.json'), true, 512, JSON_THROW_ON_ERROR);
        $lock = json_decode(file_get_contents($root.'/composer.lock'), true, 512, JSON_THROW_ON_ERROR);

        $declared = $this->minimumVersion($composer['require']['php']);
        $tooNew = [];

        foreach (['packages', 'packages-dev'] as $section) {
            foreach ($lock[$section] as $package) {
                $constraint = $package['require']['php'] ?? null;

                if ($constraint !== null && $this->minimumVersion($constraint) > $declared) {
                    $tooNew[] = "{$package['name']} {$package['version']} (php {$constraint})";
                }
            }
        }

        $this->assertSame(
            [],
            $tooNew,
            "composer.json dichiara php {$composer['require']['php']} ma questi pacchetti bloccati richiedono di più. "
            .'Rigenera il lock con `config.platform.php` allineato oppure alza il PHP minimo (e la CI).'
        );
    }

    /**
     * Versione minima ammessa da un vincolo (euristica per >=, ^, ~ e ||), come [maggiore, minore].
     * Il patch viene ignorato: ">=8.4.1" e "^8.4" contano entrambi come 8.4.
     *
     * @return array{0: int, 1: int}
     */
    private function minimumVersion(string $constraint): array
    {
        $minimum = null;

        foreach (explode('||', $constraint) as $alternative) {
            preg_match('/(\d+)\.(\d+)/', $alternative, $match);
            $version = [(int) ($match[1] ?? 0), (int) ($match[2] ?? 0)];

            if ($minimum === null || $version < $minimum) {
                $minimum = $version;
            }
        }

        return $minimum;
    }
}
