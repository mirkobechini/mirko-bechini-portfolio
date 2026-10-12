<?php

namespace Tests\Feature;

use App\GithubSync\GithubApiException;
use App\GithubSync\GithubClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GithubClientTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.github.username' => 'mirkobechini',
            'services.github.token' => null,
            'services.github.api_url' => 'https://api.github.com',
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function repo(string $name, array $overrides = []): array
    {
        return array_merge([
            'name' => $name,
            'html_url' => "https://github.com/mirkobechini/{$name}",
            'homepage' => null,
            'language' => 'PHP',
            'topics' => ['laravel'],
            'stargazers_count' => 3,
            'pushed_at' => '2026-09-01T10:00:00Z',
            'fork' => false,
            'archived' => false,
        ], $overrides);
    }

    public function test_it_asks_for_the_owner_repositories_with_the_expected_request(): void
    {
        Http::fake(['api.github.com/*' => Http::response([])]);

        (new GithubClient)->publicRepositories();

        Http::assertSent(function (Request $request): bool {
            return str_starts_with($request->url(), 'https://api.github.com/users/mirkobechini/repos')
                && $request['per_page'] === 100
                && $request['page'] === 1
                && $request->hasHeader('Accept', 'application/vnd.github+json')
                && $request->hasHeader('X-GitHub-Api-Version', '2022-11-28')
                && $request->hasHeader('User-Agent');
        });
    }

    public function test_it_sends_the_token_when_configured(): void
    {
        config(['services.github.token' => 'github_pat_segreto']);
        Http::fake(['api.github.com/*' => Http::response([])]);

        $client = new GithubClient;
        $client->publicRepositories();

        $this->assertTrue($client->hasToken());
        Http::assertSent(fn (Request $request): bool => $request->hasHeader('Authorization', 'Bearer github_pat_segreto'));
    }

    public function test_it_works_without_a_token(): void
    {
        Http::fake(['api.github.com/*' => Http::response([$this->repo('uno')])]);

        $client = new GithubClient;
        $result = $client->publicRepositories();

        $this->assertFalse($client->hasToken());
        $this->assertCount(1, $result['repos']);
        Http::assertSent(fn (Request $request): bool => ! $request->hasHeader('Authorization'));
    }

    public function test_it_skips_forks_and_archived_repositories_and_counts_them(): void
    {
        Http::fake(['api.github.com/*' => Http::response([
            $this->repo('buono'),
            $this->repo('un-fork', ['fork' => true]),
            $this->repo('vecchio', ['archived' => true]),
        ])]);

        $result = (new GithubClient)->publicRepositories();

        $this->assertSame(['buono'], array_column($result['repos'], 'name'));
        $this->assertSame(2, $result['skipped']);
    }

    public function test_it_normalizes_the_fields_it_needs(): void
    {
        Http::fake(['api.github.com/*' => Http::response([$this->repo('x', [
            'homepage' => 'https://x.example.com',
            'language' => 'JavaScript',
            'topics' => ['react', 'vite', 42, null],
            'stargazers_count' => 12,
            'description' => 'ignorata',
            'owner' => ['login' => 'ignorato'],
        ])])]);

        $repo = (new GithubClient)->publicRepositories()['repos'][0];

        $this->assertSame([
            'name' => 'x',
            'html_url' => 'https://github.com/mirkobechini/x',
            'homepage' => 'https://x.example.com',
            'language' => 'JavaScript',
            'topics' => ['react', 'vite'],
            'stars' => 12,
            'pushed_at' => '2026-09-01T10:00:00Z',
        ], $repo);
    }

    public function test_it_follows_the_pagination_until_a_short_page(): void
    {
        $page1 = array_map(fn (int $i) => $this->repo("repo-{$i}"), range(1, 100));
        $page2 = [$this->repo('repo-101'), $this->repo('repo-102')];

        Http::fake(function (Request $request) use ($page1, $page2) {
            return Http::response($request['page'] === 1 ? $page1 : $page2);
        });

        $result = (new GithubClient)->publicRepositories();

        $this->assertCount(102, $result['repos']);
        Http::assertSentCount(2);
    }

    public function test_an_invalid_token_gives_a_clear_message(): void
    {
        config(['services.github.token' => 'scaduto']);
        Http::fake(['api.github.com/*' => Http::response(['message' => 'Bad credentials'], 401)]);

        $this->expectException(GithubApiException::class);
        $this->expectExceptionMessage('token');

        (new GithubClient)->publicRepositories();
    }

    public function test_the_rate_limit_is_recognized_and_suggests_a_token_when_there_is_none(): void
    {
        Http::fake(['api.github.com/*' => Http::response(['message' => 'rate limit'], 403, [
            'X-RateLimit-Remaining' => '0',
            'X-RateLimit-Reset' => (string) now()->addMinutes(30)->timestamp,
        ])]);

        try {
            (new GithubClient)->publicRepositories();
            $this->fail('Doveva lanciare GithubApiException');
        } catch (GithubApiException $e) {
            $this->assertStringContainsString('Limite di richieste', $e->getMessage());
            $this->assertStringContainsString('GITHUB_TOKEN', $e->getMessage());
        }
    }

    public function test_the_rate_limit_message_does_not_suggest_a_token_when_one_is_used(): void
    {
        config(['services.github.token' => 'valido']);
        Http::fake(['api.github.com/*' => Http::response([], 429)]);

        try {
            (new GithubClient)->publicRepositories();
            $this->fail('Doveva lanciare GithubApiException');
        } catch (GithubApiException $e) {
            $this->assertStringContainsString('Limite di richieste', $e->getMessage());
            $this->assertStringNotContainsString('GITHUB_TOKEN', $e->getMessage());
        }
    }

    public function test_a_forbidden_error_that_is_not_the_rate_limit_is_a_generic_error(): void
    {
        Http::fake(['api.github.com/*' => Http::response(['message' => 'Forbidden'], 403, ['X-RateLimit-Remaining' => '55'])]);

        $this->expectException(GithubApiException::class);
        $this->expectExceptionMessage('errore (403)');

        (new GithubClient)->publicRepositories();
    }

    public function test_an_unknown_user_gives_a_clear_message(): void
    {
        Http::fake(['api.github.com/*' => Http::response(['message' => 'Not Found'], 404)]);

        $this->expectException(GithubApiException::class);
        $this->expectExceptionMessage('GITHUB_USERNAME');

        (new GithubClient)->publicRepositories();
    }

    public function test_a_server_error_is_retried_and_then_reported(): void
    {
        Http::fake(['api.github.com/*' => Http::response('boom', 502)]);

        try {
            (new GithubClient)->publicRepositories();
            $this->fail('Doveva lanciare GithubApiException');
        } catch (GithubApiException $e) {
            $this->assertStringContainsString('(502)', $e->getMessage());
        }

        Http::assertSentCount(3); // il tentativo iniziale + 2 nuovi tentativi
    }

    public function test_client_errors_are_not_retried(): void
    {
        Http::fake(['api.github.com/*' => Http::response([], 404)]);

        try {
            (new GithubClient)->publicRepositories();
        } catch (GithubApiException) {
            // atteso: qui conta solo quante richieste sono partite
        }

        Http::assertSentCount(1);
    }

    public function test_a_connection_failure_gives_a_clear_message(): void
    {
        Http::fake(fn () => throw new ConnectionException('timeout'));

        $this->expectException(GithubApiException::class);
        $this->expectExceptionMessage('Impossibile contattare GitHub');

        (new GithubClient)->publicRepositories();
    }

    public function test_an_unexpected_body_is_rejected(): void
    {
        Http::fake(['api.github.com/*' => Http::response('non json', 200)]);

        $this->expectException(GithubApiException::class);
        $this->expectExceptionMessage('non valida');

        (new GithubClient)->publicRepositories();
    }
}
