<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\PublicCourses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $response = response()->json(PublicCourses::payload());

        $response->setEtag(md5($response->getContent()));
        $response->setCache(['public' => true, 'max_age' => 300, 's_maxage' => 600, 'stale_while_revalidate' => 60]);
        $response->isNotModified($request);

        return $response;
    }
}
