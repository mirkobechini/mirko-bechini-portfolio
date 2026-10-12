<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    // Sincronizzazione dei progetti con GitHub (php artisan github:sync-projects).
    // Il token è facoltativo (fine-grained, sola lettura sui repository pubblici): senza, il limite è
    // di 60 richieste/ora per IP. Va messo solo in .env / nelle variabili di Laravel Cloud, mai nel repo.
    'github' => [
        'username' => env('GITHUB_USERNAME', 'mirkobechini'),
        'token' => env('GITHUB_TOKEN'),
        'api_url' => 'https://api.github.com',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
