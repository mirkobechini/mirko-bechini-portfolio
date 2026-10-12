<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\PublicProjects;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Elenco pubblico dei progetti visibili, in sola lettura.
     *
     * Risponde con ETag e Cache-Control: browser e CDN possono riusare la risposta per qualche minuto e
     * rivalidarla con If-None-Match (304, senza corpo) invece di scaricarla di nuovo.
     */
    public function index(Request $request): JsonResponse
    {
        $payload = PublicProjects::payload();

        $response = response()->json($payload);
        $response->setEtag(md5((string) json_encode($payload)));
        $response->setCache([
            'public' => true,
            'max_age' => 300,
            's_maxage' => 600,
            'stale_while_revalidate' => 60,
        ]);

        $response->isNotModified($request);

        return $response;
    }
}
