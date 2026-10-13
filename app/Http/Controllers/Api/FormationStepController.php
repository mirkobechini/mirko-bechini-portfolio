<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithCachedJson;
use App\Http\Controllers\Controller;
use App\Support\PublicFormationSteps;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FormationStepController extends Controller
{
    use RespondsWithCachedJson;

    public function index(Request $request): JsonResponse
    {
        return $this->cachedJson($request, PublicFormationSteps::payload());
    }
}
