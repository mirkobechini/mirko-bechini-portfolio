# 🚀 MirkoBechini-Portfolio

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Laravel](https://img.shields.io/badge/Laravel-12-FB2E1D?logo=laravel&logoColor=white&style=flat-square)](https://laravel.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Last Commit](https://img.shields.io/github/last-commit/mirkobechini/mirko-bechini-portfolio/main?style=flat-square)](https://github.com/mirkobechini/mirko-bechini-portfolio/commits)

> Portfolio personale interattivo con stile retrò, costruito con React, Laravel e NES.css.

![Banner o Screenshot](./readmeAssets/preview.png)

---

## 📑 Indice

- [Demo](#-demo)
- [Caratteristiche principali](#-caratteristiche-principali)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Script disponibili](#-script-disponibili)
- [Struttura del progetto](#-struttura-del-progetto)
- [GitHub Actions](#-github-actions)
- [Contatti](#-contatti)

---

## 🌍 Demo

- Live: In arrivo...
  ![Preview GIF](./readmeAssets/preview-gif.gif)

---

## 🌟 Caratteristiche principali

- **Home interattiva a scena unica**: navigazione tramite sprite cliccabili in un ambiente retrò.
- **Modali tematiche**: sezioni dedicate a About Me, Formazione & Competenze, Esperienze & Progetti, Certificazioni e Contatti.
- **Backend Laravel 12**: API pronte per future integrazioni, rotte gestite lato server.
- **Gestione stato globale**: apertura/chiusura modali via Context API.
- **Navigazione drag/touch**: esplorazione orizzontale della scena con mouse e dispositivi touch ottimizzata via `requestAnimationFrame`.
- **Lazy loading modali**: ogni modale è caricato dinamicamente con `React.lazy()` all'apertura, riducendo il bundle iniziale.
- **Navigazione da tastiera**: hook `useKeyboardNavigation` per navigazione frecce (lineare o a griglia) nei modali.
- **CSS modulare**: ogni componente ha il proprio CSS Module per stili incapsulati.

---

## 🛠️ Tech Stack

| Settore              | Tecnologie                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black&style=flat-square) ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?logo=reactrouter&logoColor=white&style=flat-square)       |
| **Backend**          | ![Laravel](https://img.shields.io/badge/-Laravel-FB2E1D?logo=laravel&logoColor=white&style=flat-square) ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white&style=flat-square)                                                                                                                                                                                                                                             |
| **Markup & Styling** | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=flat-square) ![NES.css](https://img.shields.io/badge/-NES.css-000000?logo=css3&logoColor=white&style=flat-square)                                                                                                                                           |
| **Strumenti**        | ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white&style=flat-square) ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square) ![Lighthouse](https://img.shields.io/badge/-Lighthouse-F44B21?logo=lighthouse&logoColor=white&style=flat-square) ![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white&style=flat-square) |
| **AI**               | ![GitHub Copilot](https://img.shields.io/badge/-GitHub%20Copilot-181717?logo=githubcopilot&logoColor=white&style=flat-square) ![Gemini](https://img.shields.io/badge/-Gemini-4285F4?logo=google&logoColor=white&style=flat-square)                                                                                                                                                                                                              |

### Frameworks e Librerie

| Frontend                                                   | Backend                              |
| :--------------------------------------------------------- | :----------------------------------- |
| [React](https://react.dev) ^19.2.4                         | [Laravel](https://laravel.com) ^12.0 |
| [React Router](https://reactrouter.com) ^7                 | [PHP](https://php.net) ^8.2          |
| [Vite](https://vitejs.dev) ^8                              |                                      |
| [NES.css](https://nostalgic-css.github.io/NES.css/) ^2.2.1 |                                      |

---

## 🚀 Quick Start

### Prerequisiti

- Node.js 24+
- PHP 8.2+
- Composer 2.x

### Installazione

```bash
# Clona la repository
git clone https://github.com/mirkobechini/mirko-bechini-portfolio.git
cd mirko-bechini-portfolio

# Installa dipendenze PHP (Laravel)
composer install

# Installa dipendenze JavaScript
npm install

# Prepara l'ambiente
cp .env.example .env
php artisan key:generate

# Avvia l'ambiente di sviluppo (unico comando)
npm run dev
```

Visita [http://localhost:8000](http://localhost:8000) nel browser.

### Build di produzione

```bash
npm run build
```

---

## 📜 Script disponibili

| Comando                    | Descrizione                                                                       |
| :------------------------- | :-------------------------------------------------------------------------------- |
| `npm run dev`              | Avvia Vite (HMR) e Laravel (`php artisan serve`) in simultanea (via concurrently) |
| `npm run vite`             | Solo dev server Vite                                                              |
| `npm run laravel`          | Solo server Laravel                                                               |
| `npm run build`            | Build di produzione Vite                                                          |
| `npm run lint`             | Analisi statica del codice con ESLint                                             |
| `npm run preview`          | Preview del build di produzione                                                   |
| `composer run pint`        | Formatta il codice PHP secondo lo stile Laravel                                   |
| `php artisan serve`        | Avvia il server HTTP di Laravel                                                   |
| `php artisan key:generate` | Genera la chiave dell'applicazione                                                |
| `php artisan test`         | Esegue i test PHPUnit                                                             |

---

## 📁 Struttura del progetto

```
mirko-bechini-portfolio/
├── app/                        # Logica backend Laravel
│   ├── Http/Controllers/       # Controller
│   ├── Models/                 # Modelli Eloquent
│   └── Providers/              # Service provider
├── config/                     # Configurazioni Laravel
├── database/                   # Migrazioni, factories, seeders
├── public/
│   ├── assets/                 # Asset statici (immagini, sprite, sfondi)
│   ├── build/                  # Output build Vite (generato)
│   └── index.php               # Front controller Laravel
├── resources/
│   ├── js/
│   │   ├── app.js              # Entry point Vite (importa main.jsx)
│   │   ├── bootstrap.js        # Bootstrap JS (Axios)
│   │   └── src/                # ★ App React (componenti, pagine, contesto)
│   │       ├── components/     # Componenti UI (layout, ScrollGuideIndicators)
│   │       │   ├── layout/     # DefaultLayout (Outlet router)
│   │       │   └── ui/         # Componenti UI puri riutilizzabili
│   │       ├── context/        # Stato globale (Context API)
│   │       ├── data/           # Configurazioni e costanti (spriteConfig, uiConstants)
│   │       ├── features/       # Modali organizzati per sezione
│   │       │   └── modals/
│   │       │       ├── shared/     # BaseModal, ModalErrorBoundary, CSS condivisi
│   │       │       ├── about/      # AboutMeModal
│   │       │       ├── library/    # BookshelfModal, SkillsModal, FormationView, ecc.
│   │       │       ├── projects/   # ProjectExperienceModal, ProjectsModal
│   │       │       ├── certifications/ # CertificationsModal
│   │       │       └── contacts/   # ContactsModal
│   │       ├── hooks/          # Custom hooks (useDragScroll, useKeyboardNavigation)
│   │       ├── pages/          # Pagine (HomePage, 404)
│   │       ├── styles/         # CSS globali suddivisi (global, home, responsive)
│   │       └── utils/          # Utility (assets, links, preloadImages)
│   └── views/
│       └── app.blade.php       # Template Blade per l'SPA
├── routes/
│   ├── web.php                 # Rotta catch-all per il frontend React
│   └── console.php             # Comandi Artisan personalizzati
├── tests/                      # Test PHPUnit
├── .github/workflows/          # GitHub Actions CI/CD
├── vite.config.js              # Configurazione Vite
├── eslint.config.js            # Configurazione ESLint
├── lighthouserc.json           # Configurazione Lighthouse CI
└── package.json                # Dipendenze e script Node
```

---

## 🤖 GitHub Actions

Ad ogni push su `main` (o pull request) vengono eseguiti automaticamente:

1. ✅ **Setup PHP + Composer + Node.js**
2. ✅ **Install dipendenze** (PHP + Node)
3. ✅ **Controllo link rotti** (lychee)
4. ✅ **ESLint** — analisi codice React
5. ✅ **Build Vite** — build di produzione
6. ✅ **Lighthouse CI** — audit performance, accessibilità, SEO
7. ✅ **Job summary** — report riassuntivo

---

## 📞 Contatti

- **GitHub**: [@mirkobechini](https://github.com/mirkobechini)
- **Sito**: In arrivo...

---
