<!doctype html>
<html lang="it">

<head>
    <meta charset="UTF-8" />
    <meta name="description"
        content="Il portfolio di Mirko Bechini: scopri i miei progetti di sviluppo web e le mie competenze.">

    <!-- Open Graph (Facebook, LinkedIn, WhatsApp, Telegram, ecc.) -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://mirkobechini.com/" />
    <meta property="og:title" content="Mirko Bechini - Portfolio" />
    <meta property="og:description"
        content="Il portfolio di Mirko Bechini: scopri i miei progetti di sviluppo web e le mie competenze." />
    <meta property="og:image" content="{{ asset('assets/backgrounds/den.webp') }}" />
    <meta property="og:image:width" content="1568" />
    <meta property="og:image:height" content="454" />
    <meta property="og:locale" content="it_IT" />

    <link rel="canonical" href="https://mirkobechini.com/" />
    <meta name="robots" content="index, follow" />

    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" as="style"
        crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" media="print"
        onload="this.media='all'">
    <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    </noscript>
    <link rel="preload" as="image" href="/assets/backgrounds/den.webp">
    <link rel="preload" as="image" href="/assets/sprites/monkey.webp" fetchPriority="high">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mirko Bechini - Portfolio</title>

    @viteReactRefresh
    @vite(['resources/js/app.js'])
</head>

<body>
    <div id="root"></div>
</body>

</html>
