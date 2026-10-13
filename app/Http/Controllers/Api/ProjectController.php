<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithCachedJson;
use App\Http\Controllers\Controller;
use App\Support\PublicProjects;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use RespondsWithCachedJson;

    /**
     * Elenco pubblico dei progetti visibili, in sola lettura (ETag e Cache-Control: vedi il trait).
     */
    public function index(Request $request): JsonResponse
    {
        return $this->cachedJson($request, PublicProjects::payload());
    }
}
