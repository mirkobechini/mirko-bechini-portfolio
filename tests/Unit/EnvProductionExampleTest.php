<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * `.env.production.example` è il promemoria delle variabili di produzione (e ciò che `npm run predeploy`
 * controlla se esiste un `.env.production` locale): deve restare coerente con le regole del progetto.
 */
class EnvProductionExampleTest extends TestCase
{
    /**
     * @return array<string, string>
     */
    private function variables(): array
    {
        $file = dirname(__DIR__, 2).'/.env.production.example';
        $variables = [];

        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (str_starts_with(trim($line), '#') || ! str_contains($line, '=')) {
                continue;
            }

            [$name, $value] = explode('=', $line, 2);
            $variables[trim($name)] = trim($value, " \t\"");
        }

        return $variables;
    }

    public function test_it_describes_a_safe_production_setup(): void
    {
        $env = $this->variables();

        $this->assertSame('production', $env['APP_ENV']);
        $this->assertSame('false', $env['APP_DEBUG']);
        $this->assertStringStartsWith('https://', $env['APP_URL']);
        $this->assertStringEndsNotWith('/', $env['APP_URL']);
    }

    public function test_sessions_and_cache_do_not_depend_on_the_database(): void
    {
        $env = $this->variables();

        $this->assertSame('cookie', $env['SESSION_DRIVER']);
        $this->assertSame('file', $env['CACHE_STORE']);
        $this->assertSame('sync', $env['QUEUE_CONNECTION']);
    }

    public function test_uploads_go_to_a_persistent_disk_and_livewire_temporary_files_stay_local(): void
    {
        $env = $this->variables();

        $this->assertNotContains($env['UPLOADS_DISK'], ['', 'public', 'local'], 'il filesystem di Cloud non è persistente');
        $this->assertSame('local', $env['LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK']);
    }

    public function test_it_contains_no_secrets(): void
    {
        $env = $this->variables();

        foreach (['GITHUB_TOKEN', 'APP_KEY', 'DB_PASSWORD', 'AWS_SECRET_ACCESS_KEY', 'AWS_ACCESS_KEY_ID'] as $secret) {
            $this->assertSame('', $env[$secret] ?? '', "$secret non va nel file");
        }

        $this->assertDoesNotMatchRegularExpression(
            '/github_pat_|ghp_|AKIA[0-9A-Z]{12}|BEGIN (RSA|PRIVATE)/',
            file_get_contents(dirname(__DIR__, 2).'/.env.production.example')
        );
    }

    public function test_it_keeps_the_github_username_used_by_the_sync(): void
    {
        $this->assertSame('mirkobechini', $this->variables()['GITHUB_USERNAME']);
    }

    public function test_the_predeploy_scripts_check_the_same_rules(): void
    {
        foreach (['predeploy.sh', 'predeploy.ps1'] as $script) {
            $content = file_get_contents(dirname(__DIR__, 2).'/scripts/'.$script);

            foreach (['APP_DEBUG', 'APP_ENV', 'APP_URL', 'UPLOADS_DISK', 'GITHUB_TOKEN', 'AWS_SECRET_ACCESS_KEY', 'DB_PASSWORD'] as $name) {
                $this->assertStringContainsString($name, $content, "$script non controlla $name");
            }
        }
    }
}
