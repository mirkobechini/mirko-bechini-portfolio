<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithCachedJson;
use App\Http\Controllers\Controller;
use App\Support\PublicAbout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    use RespondsWithCachedJson;

    public function show(Request $request): JsonResponse
    {
        return $this->cachedJson($request, PublicAbout::payload());
    }
}
