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
    <link rel="apple-touch-icon" href="/icons/pwa-192x192.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#1a1a1a" />
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

    <!-- Iubenda Privacy & Cookie Policy -->
    <script type="text/javascript">
        (function(w, d) {
            var loader = function() {
                var s = d.createElement("script"),
                    tag = d.getElementsByTagName("script")[0];
                s.src = "https://cdn.iubenda.com/iubenda.js";
                tag.parentNode.insertBefore(s, tag);
            };
            if (w.addEventListener) {
                w.addEventListener("load", loader, false);
            } else if (w.attachEvent) {
                w.attachEvent("onload", loader);
            } else {
                w.onload = loader;
            }
        })(window, document);
    </script>

    @viteReactRefresh
    @vite(['resources/js/app.js'])
</head>

<body>
    <div id="root"></div>

    <!-- Iubenda legal links -->
    <div
        style="position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; gap: 1rem; padding: 0.5rem; background: rgba(26, 26, 26, 0.85); z-index: 9999; font-size: 0.625rem;">
        <a href="https://www.iubenda.com/privacy-policy/41686608" class="iubenda-white iubenda-noiframe iubenda-embed"
            title="Privacy Policy" style="color: #ffe066; text-decoration: none;">Privacy Policy</a>
        <a href="https://www.iubenda.com/privacy-policy/41686608/cookie-policy"
            class="iubenda-white iubenda-noiframe iubenda-embed" title="Cookie Policy"
            style="color: #ffe066; text-decoration: none;">Cookie Policy</a>
    </div>
</body>

</html>
