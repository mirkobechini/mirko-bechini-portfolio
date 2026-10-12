<?php

namespace App\GithubSync;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

/**
 * Legge dalla GitHub REST API i repository pubblici dell'utente configurato.
 */
class GithubClient
{
    private const PER_PAGE = 100;

    private const MAX_PAGES = 10;

    /**
     * Repository da importare (fork e archiviati esclusi) e quanti ne sono stati scartati.
     *
     * @return array{repos: list<array<string, mixed>>, skipped: int}
     *
     * @throws GithubApiException
     */
    public function publicRepositories(): array
    {
        $username = (string) config('services.github.username');
        $repos = [];
        $skipped = 0;

        for ($page = 1; $page <= self::MAX_PAGES; $page++) {
            try {
                $response = $this->request()->get("/users/{$username}/repos", [
                    'type' => 'owner',
                    'sort' => 'pushed',
                    'direction' => 'desc',
                    'per_page' => self::PER_PAGE,
                    'page' => $page,
                ]);
            } catch (ConnectionException) {
                throw new GithubApiException('Impossibile contattare GitHub (connessione assente o troppo lenta).');
            } catch (RequestException $e) {
                throw GithubApiException::fromResponse($e->response, $this->hasToken());
            }

            if ($response->failed()) {
                throw GithubApiException::fromResponse($response, $this->hasToken());
            }

            $items = $response->json();

            if (! is_array($items)) {
                throw new GithubApiException('Risposta di GitHub non valida.');
            }

            foreach ($items as $item) {
                if (($item['fork'] ?? false) || ($item['archived'] ?? false)) {
                    $skipped++;

                    continue;
                }

                $repos[] = $this->normalize($item);
            }

            if (count($items) < self::PER_PAGE) {
                break;
            }
        }

        return ['repos' => $repos, 'skipped' => $skipped];
    }

    public function hasToken(): bool
    {
        return filled(config('services.github.token'));
    }

    private function request(): PendingRequest
    {
        $request = Http::baseUrl((string) config('services.github.api_url'))
            ->withHeaders([
                'Accept' => 'application/vnd.github+json',
                'X-GitHub-Api-Version' => '2022-11-28',
                'User-Agent' => 'portfolio-github-sync',
            ])
            ->timeout(15)
            // 3 tentativi in tutto, e solo se GitHub ha un problema suo (5xx) o non risponde: mai sugli errori 4xx
            ->retry(3, 500, fn ($exception) => $exception instanceof ConnectionException
                || ($exception instanceof RequestException && $exception->response->serverError()), throw: false);

        if ($this->hasToken()) {
            $request = $request->withToken((string) config('services.github.token'));
        }

        return $request;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function normalize(array $item): array
    {
        return [
            'name' => (string) $item['name'],
            'html_url' => (string) $item['html_url'],
            'homepage' => $item['homepage'] ?? null,
            'language' => $item['language'] ?? null,
            'topics' => array_values(array_filter((array) ($item['topics'] ?? []), 'is_string')),
            'stars' => (int) ($item['stargazers_count'] ?? 0),
            'pushed_at' => $item['pushed_at'] ?? null,
        ];
    }
}
