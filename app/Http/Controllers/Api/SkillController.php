<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithCachedJson;
use App\Http\Controllers\Controller;
use App\Support\PublicSkills;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    use RespondsWithCachedJson;

    public function index(Request $request): JsonResponse
    {
        return $this->cachedJson($request, PublicSkills::payload());
    }
}
