# 🚀 MirkoBechini-Portfolio

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Laravel](https://img.shields.io/badge/Laravel-13-FB2E1D?logo=laravel&logoColor=white&style=flat-square)](https://laravel.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white&style=flat-square)](https://github.com/mirkobechini/mirko-bechini-portfolio/actions)

> Portfolio personale interattivo con stile retrò pixel-art, costruito con React, Laravel e NES.css.

![Preview](./readmeAssets/preview.png)

---

## 📑 Indice

- [Demo](#-demo)
- [Caratteristiche principali](#-caratteristiche-principali)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Script disponibili](#-script-disponibili)
- [Dati dei progetti](#-dati-dei-progetti)
- [Test](#-test)
- [Sicurezza](#-sicurezza)
- [Pannello di amministrazione](#️-pannello-di-amministrazione)
- [Sincronizzazione con GitHub](#-sincronizzazione-con-github)
- [Deploy](#-deploy)
- [Struttura del progetto](#-struttura-del-progetto)
- [GitHub Actions](#-github-actions)
- [Contatti](#-contatti)

---

## 🌍 Demo

- **Live:** [https://mirkobechini.com](https://mirkobechini.com)
  ![Preview GIF](./readmeAssets/preview-gif.gif)

---

## 🌟 Caratteristiche principali

- **Scena interattiva a scorrimento**: esplorazione orizzontale di un ambiente retrò popolato da sprite cliccabili.
- **Modali tematiche lazy-loaded**: About Me, Formazione & Competenze, Esperienze & Progetti, Certificazioni e Contatti — ogni modale è caricata dinamicamente con `React.lazy()` all'apertura.
- **Progetti da GitHub**: l'elenco viene letto dalla GitHub REST API, con cache locale (30 min), fallback sui dati vecchi e, in ultima istanza, su un elenco statico. Vedi [Dati dei progetti](#-dati-dei-progetti).
- **Drag & touch navigation**: scrolling orizzontale fluido ottimizzato con `requestAnimationFrame` per mouse e dispositivi touch.
- **Navigazione da tastiera e accessibilità**: hook `useKeyboardNavigation`, focus trap e ripristino del focus nelle modali, messaggi di stato con `role="status"`.
- **Stato globale con Context API**: apertura/chiusura modali e stato dell'app gestiti centralmente.
- **CSS modulare**: ogni componente ha il proprio CSS module (nessun file sopra le 400 righe).
- **Backend Laravel 13**: serve l'SPA React, risponde con un vero **404** alle URL sconosciute e aggiunge gli [header di sicurezza](#-sicurezza). Pronto per future API.
- **Ottimizzazione asset**: `nes-core` al posto del bundle completo di NES.css, preload di font e immagini critiche, PWA con service worker per caching intelligente.
- **Test**: oltre 370 test Vitest (copertura righe ~92%) e test PHPUnit sulle rotte e sugli header.
- **CI/CD completo**: GitHub Actions con ESLint, build Vite, test PHP e audit Lighthouse.

---

## 🛠️ Tech Stack

| Settore              | Tecnologie                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend**         | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black&style=flat-square) ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?logo=reactrouter&logoColor=white&style=flat-square)                                                                                                   |
| **Backend**          | ![Laravel](https://img.shields.io/badge/-Laravel-FB2E1D?logo=laravel&logoColor=white&style=flat-square) ![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white&style=flat-square)                                                                                                                                                                                                                                                                                                                                         |
| **Markup & Styling** | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=flat-square) ![NES.css](https://img.shields.io/badge/-NES.css-000000?logo=css3&logoColor=white&style=flat-square)                                                                                                                                                                                                                                       |
| **Strumenti**        | ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white&style=flat-square) ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square) ![Lighthouse](https://img.shields.io/badge/-Lighthouse-F44B21?logo=lighthouse&logoColor=white&style=flat-square) ![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white&style=flat-square) ![PWA](https://img.shields.io/badge/-PWA-5A0FC8?logo=pwa&logoColor=white&style=flat-square) |

### Dipendenze principali

| Frontend                                                   | Backend                              |
| :--------------------------------------------------------- | :----------------------------------- |
| [React](https://react.dev) ^19.2.7                         | [Laravel](https://laravel.com) ^13.0 |
| [React Router](https://reactrouter.com) ^7.18              | [PHP](https://php.net) ^8.4          |
| [Vite](https://vitejs.dev) ^8.0                            |                                      |
| [NES.css](https://nostalgic-css.github.io/NES.css/) ^2.2.1 |                                      |
| [Vitest](https://vitest.dev) ^4.1 (test)                   |                                      |

---

## 🚀 Quick Start

### Prerequisiti

- Node.js 24+
- PHP 8.4+ (in produzione 8.5)
- Composer 2.x

### Installazione

```bash
# Clona la repository
git clone https://github.com/mirkobechini/mirko-bechini-portfolio.git
cd mirko-bechini-portfolio

# Installa dipendenze PHP (Laravel) e JavaScript
composer install
npm install

# Prepara l'ambiente
cp .env.example .env
php artisan key:generate
```

### Avvio in sviluppo

Servono due cose: il dev server di Vite (HMR) e un server PHP che serva Laravel.

**Con [Laravel Herd](https://herd.laravel.com)** (consigliato su Windows/macOS):

```bash
herd link mirkobechini-portfolio   # una tantum, dalla cartella del progetto
npm run vite                       # dev server Vite
```

Poi apri `http://mirkobechini-portfolio.test` e imposta `APP_URL=http://mirkobechini-portfolio.test` nel `.env`.

**Senza Herd:**

```bash
npm run dev:serve                  # Vite + php artisan serve in parallelo
```

Poi apri [http://127.0.0.1:8000](http://127.0.0.1:8000).

> ⚠️ Su Windows con PHP 8.4 `php artisan serve` può fallire con `Failed to listen on 127.0.0.1:8000 (reason: ?)` su ogni porta. In quel caso usa Herd, oppure `php -S 127.0.0.1:8000 -t public public/index.php`.
>
> Se la pagina resta bianca, cancella `public/hot` (rimasto da un vecchio dev server) e rilancia Vite. Tieni **un solo** dev server Vite alla volta.

### Build di produzione

```bash
npm run build
```

---

## 📜 Script disponibili

| Comando                               | Descrizione                                                                  |
| :------------------------------------ | :--------------------------------------------------------------------------- |
| `npm run dev` / `npm run vite`        | Dev server Vite (HMR)                                                        |
| `npm run dev:serve`                   | Vite + `php artisan serve` in simultanea (via concurrently)                  |
| `npm run laravel`                     | Solo `php artisan serve`                                                     |
| `npm run build`                       | Build di produzione Vite                                                     |
| `npm run preview`                     | Preview del build di produzione                                              |
| `npm run lint`                        | Analisi statica con ESLint                                                   |
| `npm test`                            | Test JavaScript (Vitest, una esecuzione)                                     |
| `npm run test:watch`                  | Vitest in modalità watch                                                     |
| `npm run test:coverage`               | Test con report di copertura (testo + `coverage/index.html`)                 |
| `npm run lighthouse`                  | Lighthouse CI in locale (scarica `@lhci/cli` al volo con `npx`)              |
| `npm run predeploy`                   | Controlli prima del deploy (PowerShell). `predeploy:sh` per la versione bash |
| `php artisan test`                    | Test PHPUnit                                                                 |
| `./vendor/bin/pint`                   | Formatta il codice PHP secondo lo stile Laravel                              |
| `node scripts/resize-sprites.mjs`     | Ridimensiona gli sprite nella dimensione desiderata                          |
| `node scripts/generate-logo-icons.mjs` | Genera favicon, icone PWA (anche maskable) e icona iOS dal logo `public/favicon.svg` |
| `node scripts/generate-pwa-icons.mjs` | Genera segnaposto dei progetti e screenshot della PWA (non più le icone)     |

---

## 🐙 Dati dei progetti

L'elenco progetti viene dal backend: il browser non chiama più GitHub.

```
GitHub ──(sync, scheduler)──► database ──► /api/projects ──► useProjects ──► ProjectsModal
                                  ▲
                     pannello /admin (descrizione, tipo, scope, nascosto, in evidenza)
```

- **`services/projectsApi.js`** chiama `GET /api/projects` (vedi "API pubblica").
- **Dettaglio del progetto** (`components/ProjectDetailView.jsx`): cliccando una card (o con Invio/Spazio) il dettaglio prende il posto dell'elenco, con "‹ Torna ai progetti" (e il focus torna sulla card). Mostra anteprima grande (se caricata), tipo e ambito, descrizione intera, stelle, ultimo aggiornamento, corso e link; la card resta leggera (anteprima, titolo, descrizione accorciata, tecnologie). Cambiando un filtro, o se il progetto sparisce dai dati, si torna all'elenco.
- **`services/projectMapper.js`** aggiunge ciò che l'API non manda: l'anteprima segnaposto e i valori di default.
- **`hooks/useApiList.js`** è la logica comune (usata da `useProjects`, `useSkills`, `useCourses`, `useCertifications`, `useContacts` e `useFormationSteps`); ciascun hook indica solo chiave di cache, funzione di lettura, mapper e dati statici di riserva. Mostra subito i dati già in `localStorage` e **a ogni apertura li ricontrolla in background** (richiesta condizionale: se nulla è cambiato il server risponde `304`): una modifica dal pannello compare entro il minuto della cache di rete. Con dati freschi un errore di rete è silenzioso; senza, si usano i dati scaduti o quelli statici di riserva con un avviso.
- **`hooks/useProjects.js`** usa `useApiList`: dati in memoria → API → dati statici `fallbackProjects.js`. Se l'API non risponde o restituisce una lista vuota (e non ci sono dati freschi), la modal mostra un avviso.
- Se cambi il **formato** dei dati in cache, incrementa `CACHE_KEY` in `useProjects.js` (oggi `projects_api_cache_v1`).

Per aggiungere, nascondere o modificare un progetto usa il pannello `/admin` (vedi "Pannello di amministrazione"); nessun deploy necessario.

---

## 🧪 Test

```bash
npm test                 # JS: Vitest + Testing Library (jsdom)
npm run test:coverage    # con report di copertura
php artisan test         # PHP: rotte, 404, header di sicurezza, versione PHP del lock
```

- I test JS stanno in `resources/js/src/test/`. Oltre ai componenti e agli hook, ci sono controlli "di guardia" sul CSS (es. `cssKeyframes.test.js` verifica che ogni `animation:` abbia il suo `@keyframes`: nei CSS modules un nome scritto in camelCase invece che kebab-case fa semplicemente non partire l'animazione).
- I test PHP stanno in `tests/Feature/`.
- La CI esegue lint, test JS, build e test PHP (vedi [GitHub Actions](#-github-actions)).

---

## 🔐 Sicurezza

Il middleware `App\Http\Middleware\SecurityHeaders` (registrato in `bootstrap/app.php`) imposta su ogni risposta:

| Header                                | Valore                                                                |
| :------------------------------------ | :-------------------------------------------------------------------- |
| `X-Content-Type-Options`              | `nosniff`                                                             |
| `X-Frame-Options`                     | `SAMEORIGIN`                                                          |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`                                     |
| `Permissions-Policy`                  | `camera=(), microphone=(), geolocation=()`                            |
| `Content-Security-Policy`             | policy per Google Fonts, Iubenda e immagini https (**blocca**; `SECURITY_CSP_MODE=report-only` per solo segnalare) |
| `Strict-Transport-Security`           | disattivato di default (`SECURITY_HSTS=true` per attivarlo)           |

- La **CSP è attiva** (blocca ciò che non ammette). Prima di attivarla l'ho verificata sul sito vero con un browser automatico (94 clic su desktop e mobile nelle 5 sezioni, più le pagine privacy e cookie di Iubenda): nessuna violazione. **Se dopo un deploy qualcosa smette di funzionare** (un'immagine, un font, uno script di terze parti), imposta `SECURITY_CSP_MODE=report-only` su Laravel Cloud: il browser torna a segnalare in console senza bloccare, senza toccare il codice. Quando aggiungi una terza parte (un nuovo CDN, un widget), ammettila in `SecurityHeaders::contentSecurityPolicy()`.
- In **sviluppo** vedrai violazioni per gli script e il WebSocket di Vite (`localhost:5173`): sono normali.
- **HSTS** è già gestito da Cloudflare: non attivarlo anche in Laravel per non duplicarlo.
- `trustProxies('*')` è attivo perché l'app sta dietro Cloudflare e Laravel Cloud.
- Gli URL sconosciuti rispondono **404** (con la pagina d'errore dell'SPA), non 200.

---

## 🛡️ Pannello di amministrazione

Il pannello (Filament 5) è su **`/admin`** e serve ad aggiornare i contenuti del sito senza fare un deploy. Oggi c'è l'accesso protetto; le risorse (progetti, competenze...) arrivano per fasi, vedi `FUTURE-PLAN.md`.

- **Accesso:** solo utenti con `is_admin = true`. Un utente creato dal comando **non entra** finché non viene abilitato a mano (la colonna non è assegnabile in massa, di proposito).
- **2FA obbligatoria** con app autenticatrice (al primo accesso il pannello obbliga a configurarla e mostra i codici di recupero: vanno conservati).
- **Nessuna registrazione pubblica:** gli utenti si creano solo da comando.
- Il pannello è escluso dalla CSP, dal service worker della PWA e dall'indicizzazione (`robots.txt`).
- **Attestati da PDF** (`/admin/certifications` e, per l'attestato di un corso, `/admin/courses`): oltre a un'immagine, si può caricare un **PDF**: la sua prima pagina diventa l'immagine della certificazione (WebP, al massimo 1600 px di larghezza) e **il PDF non viene conservato né pubblicato** (nessuno può scaricare l'originale). La conversione la fa il backend di PdfEditor (`pdfeditor-api.mirkobechini.com`, FastAPI + PyMuPDF): il PDF ci resta solo il tempo della conversione (giro: accesso ospite → caricamento → esportazione in PNG → cancellazione, circa 5 secondi) e l'accesso ospite si riusa finché non scade. Se il servizio non risponde il pannello non salva nulla e avvisa: si può caricare direttamente un'immagine. Massimo 10 MB; l'indirizzo si imposta con `PDFEDITOR_API_URL`. **In produzione va l'indirizzo diretto di Render (`https://pdfeditor-backend-z7ue.onrender.com`), non il dominio `pdfeditor-api.mirkobechini.com`**: davanti al dominio Cloudflare ha Bot Fight Mode, che sul piano gratuito non si può escludere solo per un host e mostra la verifica "Just a moment…" alle richieste di un data center (come Laravel Cloud), bloccandole (`cf-mitigated: challenge`). Se la conversione smette di funzionare, il messaggio nel pannello riporta il codice di risposta e il dettaglio è nel log (`PdfEditor: ... non riuscito`). Il codice sta in `app/Support/PdfPreview/` (interfaccia `PdfPreviewConverter`: per usare un altro strumento, per esempio Imagick con Ghostscript, basta un'altra implementazione). Nota: Cloudflare davanti a quell'API blocca gli User-Agent predefiniti dei linguaggi, per questo il convertitore si presenta come `MirkoPortfolio/1.0`.
- **Revisione veloce dei progetti** (`/admin/projects`): categoria, ambito e corso si cambiano con un menu direttamente nella riga; selezionando più righe (anche tutte, 50 per pagina di default) le azioni di gruppo cambiano categoria, ambito, corso, raggruppamento, visibilità ed evidenza. Il filtro "Da rivedere (senza descrizione)" mostra i progetti arrivati dalla sincronizzazione e mai descritti, "Senza corso" quelli da assegnare.

**Creare l'amministratore** (in locale e, una volta, in produzione):

```bash
php artisan make:filament-user --name="Mirko" --email="LA-TUA-EMAIL" --password="PasswordTemporanea1"
php artisan tinker --execute="App\Models\User::where('email', 'LA-TUA-EMAIL')->update(['is_admin' => true]);"
```

Poi apri `/admin`, accedi e configura il 2FA; cambia la password dal profilo. Su Laravel Cloud i due comandi si lanciano dalla scheda **Commands** dell'ambiente (accettano solo comandi non interattivi, per questo si passano `--name`, `--email` e `--password`).

Gli asset di Filament (`public/css|js|fonts/filament`) **non sono nel repo**: si pubblicano da soli a ogni `composer install` (script `filament:upgrade`).

---

## 🔄 Sincronizzazione con GitHub

Il comando `php artisan github:sync-projects` legge i repository **pubblici** di GitHub e aggiorna i progetti nel database. Si gestisce dal pannello, alla pagina **Sincronizzazione GitHub** (frequenza, stato dell'ultima esecuzione e pulsante **Sincronizza ora**).

- **Cosa aggiorna:** solo i dati di GitHub, cioè stelle, data dell'ultimo push, indirizzo del repository e tecnologie (linguaggio + topics). Titolo, descrizione, categoria, ambito, sito online, tecnologie aggiuntive, raggruppamento, "in evidenza" e "nascosto" sono **solo del pannello**: il sync non li tocca mai.
- **Repository nuovi:** vengono creati **nascosti**. Vanno rivisti nei Progetti (descrizione in italiano, categoria, ambito) e poi si toglie "Nascosto".
- **Repository spariti** (cancellati, privati, archiviati): il progetto non viene toccato, restano gli ultimi dati noti. Fork e repository archiviati non si importano.
- **Frequenza:** Solo manuale / ogni giorno / **ogni settimana (predefinita)** / ogni 2 settimane / ogni mese, modificabile dal pannello senza deploy. Lo scheduler lancia il comando ogni ora e il comando parte davvero solo se la frequenza scelta lo richiede. Se una sincronizzazione fallisce, al controllo orario successivo riprova.
- **Token GitHub (facoltativo, consigliato):** senza, il limite è di 60 richieste all'ora per IP; con il token sono 5000. Va creato come *fine-grained token* con **Repository access: Public repositories (read-only)** e nessun altro permesso, e messo **solo** in `.env` e nelle variabili d'ambiente di Laravel Cloud come `GITHUB_TOKEN` (mai nel repository). Scade dopo al massimo 1 anno: se scade, il pannello lo segnala e il sync continua senza token.
- **Su Laravel Cloud** serve attivare lo **scheduler** dell'ambiente (impostazioni del cluster dell'app), altrimenti la sincronizzazione automatica non parte (resta il pulsante "Sincronizza ora").

```bash
php artisan github:sync-projects            # rispetta la frequenza scelta
php artisan github:sync-projects --force    # sincronizza subito
```

---

## 🔌 API pubblica

`GET /api/projects` restituisce i progetti visibili (non nascosti) in JSON, nella forma che usa il sito:
`id`, `title`, `description`, `projectScope`, `type`, `technologies`, `repo`, `live`, `stars`, `updatedAt`, `pinned`, `group` (solo nome).

- Ordine: prima i progetti in evidenza, poi i più recenti.
- `GET /api/skills` restituisce le competenze visibili (`id`, `skill`, `icon`, `category`, `color`, `functions`, `relatedProjects`) con le stesse regole di cache, ETag e limite. I progetti collegati sono i titoli dei progetti non nascosti più l'eventuale testo libero.
- **Immagini caricate dal pannello** (icona delle skill, attestato dei corsi, immagine delle certificazioni, anteprima dei progetti): PNG, WebP o JPG (niente SVG), fino a 512 KB per le icone e 2 MB per le altre. I file vanno sul disco `UPLOADS_DISK` (`public` in locale, dopo `php artisan storage:link`; in produzione un disco persistente) e hanno la precedenza sul percorso/URL scritto a mano nella colonna accanto. Un file sostituito o di un record eliminato viene cancellato dal disco. Senza anteprima il sito mostra il segnaposto.
- `GET /api/education` restituisce i corsi visibili (`id`, `course`, `description`, `certificate`, `organization`, `organizationUrl`, `period`, `skills`, `highlights`, `modules`, `projects`). Ogni progetto può essere collegato a un corso dal pannello (campo `course` in `/api/projects`).
  I corsi sono ordinati dal più recente al più vecchio secondo il primo mese del periodo (`started_at`, letto dal testo del periodo a ogni salvataggio); senza anno leggibile vanno in fondo.
- `GET /api/formation-steps` restituisce i passi della pagina "Percorso e prossimi step" (`id`, `kind` = `focus` o `roadmap`, `title`, `description`, `status` = `onHold`/`inProgress`/`next`/`done`, `badge`), in ordine dentro ciascuna colonna. Si gestiscono da `/admin` ("Percorso e prossimi step").
  **Il "Focus attuale" si compila da solo con i corsi** il cui stato è "In corso" o "In sospeso" (campo `status` del corso, modificabile con un menu nella lista), dal più recente; seguono i passi del Focus scritti a mano (uno con lo stesso titolo di un corso non si ripete). La descrizione dei corsi nel Focus è accorciata a 140 caratteri. Segnando un corso "Completato" esce da solo dal Focus. La Roadmap è fatta solo di passi scritti a mano. **I passi segnati "Completato" non compaiono sul sito**, né nel Focus né nella Roadmap.
- `GET /api/certifications` restituisce gli attestati visibili (`id`, `title`, `preview`, `previewWidth`, `previewHeight`, `link`, `organization`, `organizationUrl`, `skills`, `courseId`). `courseId` è il corso che il sito apre cliccando l'attestato.
  **Anche gli attestati dei corsi compaiono in galleria da soli**: un corso visibile, **Completato** e con un attestato (caricato dal pannello o scritto come indirizzo) diventa una voce `course-<id>` ("Attestato del corso …", dopo le certificazioni create a mano e dal corso più recente), che apre il corso. Se esiste già una certificazione collegata a quel corso (anche nascosta) vale quella e il corso non si ripete; un corso in corso o in sospeso non ha ancora un attestato. Larghezza e altezza dell'immagine si leggono dal file a ogni caricamento (`certificate_width`/`certificate_height`).
- `GET /api/contacts` restituisce i contatti visibili (`id`, `href`, `icon`, `label`, `variantClass`, `ariaLabel`). Il pannello accetta solo indirizzi `https://`, `http://`, `mailto:` e `tel:`, e il sito scarta comunque gli altri schemi.
- Cache lato server di 10 minuti (`api.projects.v1`), svuotata a ogni modifica.
- `ETag` + `Cache-Control` pubblico di **60 secondi** (`max-age` e `s-maxage`): davanti al sito c'è la cache di rete di Laravel Cloud, che rispetta `s-maxage`, e le modifiche dal pannello devono comparire in fretta. Se nulla è cambiato risponde `304`. Il sito chiede sempre al server se i dati sono cambiati (`cache: "no-cache"` in `apiClient.js`) e, per 2 minuti (`API_CACHE_TTL_MS` in `useApiList.js`), considera "freschi" i dati in memoria: li mostra subito senza avvisi anche se il ricontrollo fallisce.
- Limite di 60 richieste al minuto per IP (`429` in JSON).
- Sotto `/api` gli errori sono sempre JSON; nessun header CORS (il sito usa la stessa origine).
- `CACHE_STORE`: in produzione oggi è `file` (il database del piano Dev si sospende, e la cache non deve risvegliarlo). Con più istanze dell'app una modifica dal pannello può restare invisibile sull'altra istanza fino a 10 minuti: in quel caso passare a `database` (o redis).

## 🚢 Deploy

Il sito è su **Laravel Cloud** dietro **Cloudflare**; il deploy parte dal branch `main`. Flusso di lavoro: un branch per ogni modifica, merge in `dev` con `git merge --no-ff` (niente squash, per tenere traccia dei branch), `dev` → `main` solo quando si vuole pubblicare.

**Prima di fare merge su `main`:**

```bash
npm run predeploy
```

Esegue test JS e PHP, `npm audit --omit=dev` e `composer audit` (provando a correggere con `npm audit fix` / `composer update`: se cambiano i lockfile, committali) e, se esiste un `.env.production` locale (copialo da `.env.production.example`), blocca il deploy con `APP_DEBUG=true`, `APP_ENV` diverso da `production`, `APP_URL` senza `https://`, `UPLOADS_DISK` mancante o `public`/`local` (le immagini caricate andrebbero perse a ogni deploy), oppure un segreto (`GITHUB_TOKEN`, `AWS_SECRET_ACCESS_KEY`, `DB_PASSWORD`) scritto nel file.

**Versione di PHP:** `composer.json` richiede `^8.4` (minimo supportato) e la produzione va impostata su **PHP 8.5** nelle impostazioni dell'ambiente di Laravel Cloud. La CI testa 8.4 e 8.5. Il test `ComposerLockPhpVersionTest` fallisce se un `composer update` porta nel lock pacchetti che richiedono un PHP più recente del minimo dichiarato (è già successo: Symfony 8 richiede PHP ≥ 8.4).

**Variabili d'ambiente su Laravel Cloud** (nel pannello, non nel repo):

| Variabile        | Valore                          |
| :--------------- | :------------------------------ |
| `APP_ENV`        | `production`                    |
| `APP_DEBUG`      | `false`                         |
| `APP_URL`        | `https://mirkobechini.com`      |
| `LOG_LEVEL`      | `warning`                       |
| `SESSION_DRIVER` | `cookie` (il sito pubblico non ha login; niente database per le sessioni) |
| `CACHE_STORE`    | `file` (il database del piano Dev si sospende) |
| `QUEUE_CONNECTION` | `sync`                        |
| `UPLOADS_DISK`   | `uploads` (il disco del bucket; Cloud ha un filesystem non persistente) |
| `LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK` | `local`    |
| `GITHUB_USERNAME` | `mirkobechini`                 |
| `GITHUB_TOKEN`   | il token, **solo su Cloud** (sola lettura sui repo pubblici) |

Le variabili del database (`DB_*`) e del bucket (`FILESYSTEM_DISK`, `LARAVEL_CLOUD_DISK_CONFIG`) le inserisce Cloud da solo quando colleghi le risorse. L'elenco completo, con i commenti, è in `.env.production.example`.
**Dopo il deploy:** controlla gli header su [securityheaders.com](https://securityheaders.com), la console del browser (violazioni CSP), che `/pagina-inesistente` risponda 404, gli header di cache di `/build/*` e `sw.js`, e l'aggiornamento della PWA.

---

---

## 📁 Struttura del progetto

```
mirko-bechini-portfolio/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Controller (vuoti, pronti per API future)
│   │   └── Middleware/         # SecurityHeaders
│   ├── Models/                 # Modelli Eloquent
│   └── Providers/              # Service provider
├── bootstrap/app.php           # Routing, trustProxies, middleware globali
├── config/                     # Configurazioni Laravel (+ security.php)
├── database/                   # Migrazioni, factories, seeders
├── public/
│   ├── assets/                 # Asset statici (backgrounds, modali, sprite, suoni)
│   ├── build/                  # Output build Vite (generato)
│   └── index.php               # Front controller Laravel
├── resources/
│   ├── js/
│   │   ├── app.js              # Entry point Vite (importa main.jsx)
│   │   └── src/                # ★ App React
│   │       ├── App.jsx         # Root component con Router e Context
│   │       ├── main.jsx        # Punto di ingresso React
│   │       ├── components/     # Layout e componenti UI riutilizzabili
│   │       ├── context/        # Stato globale con Context API
│   │       ├── data/           # Configurazioni e costanti (spriteConfig, uiConstants)
│   │       ├── features/modals/
│   │       │   ├── shared/         # BaseModal (focus trap), ModalErrorBoundary
│   │       │   ├── about/          # AboutMeModal
│   │       │   ├── library/        # Bookshelf, Skills, Formazione (+ BookLayout.module.css)
│   │       │   ├── projects/       # ProjectsModal, components/, hooks/, services/ (GitHub API)
│   │       │   ├── certifications/ # CertificationsModal
│   │       │   └── contacts/       # ContactsModal
│   │       ├── hooks/          # useDragScroll, useKeyboardNavigation, useGithubProjects,
│   │       │                   # useLocalStorage, useSpritePreload
│   │       ├── pages/          # HomePage, NotFoundPage
│   │       ├── styles/         # CSS globali (global, home, responsive, nes-icon)
│   │       ├── test/           # Test Vitest
│   │       └── utils/          # asset paths, links, preloadImages, modalSounds, audio
│   └── views/
│       └── app.blade.php       # Template Blade SPA con preload di font e immagini
├── routes/
│   ├── web.php                 # Home + fallback 404 che serve l'SPA
│   └── console.php             # Comandi Artisan
├── scripts/
│   ├── predeploy.ps1 / .sh     # Controlli prima del deploy
│   ├── resize-sprites.mjs      # Ridimensionamento sprite
│   ├── generate-logo-icons.mjs # Favicon e icone PWA/iOS dal logo
│   └── generate-pwa-icons.mjs  # Segnaposto e screenshot PWA
├── tests/Feature/              # Test PHPUnit (rotte, header di sicurezza)
├── .github/workflows/
│   └── code-test.yml           # CI: ESLint → Vitest → build → lychee → PHP test → Lighthouse
├── vite.config.js              # Vite + React + Laravel + PWA + Vitest
├── eslint.config.js            # ESLint flat config
├── lighthouserc.json           # Soglie Lighthouse CI (SEO ≥ 0.95, Performance ≥ 0.7)
└── package.json                # Dipendenze e script Node
```

---

## 🤖 GitHub Actions

Il workflow **Verification Tests** (`code-test.yml`) si attiva su push e pull request verso `main` ed esegue:

### `quality-checks`

1. ✅ **Setup Node.js** 24
2. ✅ **Cache** `node_modules`
3. ✅ **Install** `npm ci`
4. ✅ **ESLint** — analisi codice React
5. ✅ **Vitest** — test JavaScript
6. ✅ **Build Vite** — build di produzione
7. ✅ **lychee** — controllo link rotti nei template Blade

### `php-tests`

1. ✅ **Setup PHP** 8.4 e 8.5 (matrice) + Composer
2. ✅ **Setup Node.js** 24
3. ✅ **Cache** vendor + node_modules
4. ✅ **Install** `composer install` + `npm ci`
5. ✅ **Build Vite** — asset di produzione
6. ✅ **Ambiente** `.env.ci` → `key:generate`
7. ✅ **Test** `php artisan test`

### `lighthouse`

- Eseguito solo su **push** a `main`, dopo il successo dei due job precedenti (`quality-checks` e `php-tests`, che girano in parallelo).
- Esegue audit con soglie: **SEO ≥ 0.95**, **Performance ≥ 0.7**

---

## 📞 Contatti

- **GitHub**: [@mirkobechini](https://github.com/mirkobechini)
- **LinkedIn**: [Mirko Bechini](https://www.linkedin.com/in/mirko-bechini-892202252/)
- **Sito**: [https://mirkobechini.com](https://mirkobechini.com)
