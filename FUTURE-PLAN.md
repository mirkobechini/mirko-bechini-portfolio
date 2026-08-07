# Piano di sviluppo: GitHub API → Laravel Backend

## Stato attuale

I dati dei progetti sono hardcoded in `resources/js/src/features/modals/projects/projectData.js`.
Obiettivo: renderli dinamici partendo dalla GitHub REST API, con un'architettura che permetta in futuro di migrare a un backend Laravel senza stravolgimenti.

---

## Architettura a 3 strati

### ORA: GitHub API

```
ProjectsModal → useGithubProjects → GitHub REST API
                                  → projectsMeta.js (mapping locale)
```

### FUTURO: Laravel backend

```
ProjectsModal → useProjects → GET /api/projects → Laravel API
                                                    ↓
                                                 php artisan github:sync-projects (cron)
```

I due percorsi condividono la **stessa interfaccia** — il `ProjectCard` e i componenti di presentazione non sanno da dove arrivano i dati.

---

## Struttura nuovi file

```
resources/js/src/
├── features/modals/projects/
│   ├── projectData.js              ← ELIMINATO (sostituito)
│   ├── services/
│   │   ├── githubApi.js            ← Chiamata a GitHub REST API
│   │   ├── projectsMeta.js         ← Mapping locale (descrizioni IT, type, scope, live)
│   │   └── projectMapper.js        ← Unisce GitHub data + meta → formato card
│   └── ProjectsModal.jsx           ← Leggermente modificato (usa useGithubProjects)
├── hooks/
│   ├── useGithubProjects.js         ← Hook: fetch + cache + loading/error
│   └── useLocalStorage.js           ← Hook generico localStorage con TTL
```

---

## Dettaglio file

### `services/projectsMeta.js`

Contiene solo ciò che GitHub **non** può fornire:

- `type` (frontend/backend/fullstack)
- `projectScope` (personal/work)
- `description` in italiano
- `live` URL personalizzato (se diverso dalla homepage GitHub)
- `exclude: true` per repo da nascondere (fork, esercizi, config)

```js
export const projectsMeta = {
    "gods-backoffice": {
        type: "backend",
        projectScope: "work",
        description: "Backend realizzato come esame finale...",
    },
    // ...
};
```

### `services/githubApi.js`

- Chiamata a `GET https://api.github.com/users/mirkobechini/repos?per_page=100&sort=pushed&direction=desc`
- Filtra fork, repo archiviati e repo in `exclude`
- Restituisce dati grezzi

### `services/projectMapper.js`

- Prende i dati GitHub + `projectsMeta` e produce array nel formato atteso da `ProjectCard`
- Arricchisce `technologies` con: linguaggio principale + topics (da GitHub) + eventuali extra dal meta
- Aggiunge `stars`, `updatedAt` come nuovi campi

### `hooks/useLocalStorage.js`

Hook generico e riutilizzabile:

- Legge/scrive da `localStorage`
- Supporta TTL (time-to-live in millisecondi)
- Se la cache è scaduta o assente, ritorna `null`
- Già pronto per essere usato anche da un futuro hook Laravel

### `hooks/useGithubProjects.js`

Custom hook che orchestra il tutto:

1. Controlla `localStorage` (TTL 30 minuti)
2. Se cache valida → restituisce dati
3. Se cache scaduta → chiama `githubApi.getRepos()`
4. Trasforma con `projectMapper`
5. Salva in `localStorage`
6. Espone: `{ projects, loading, error, refetch }`
7. Fallback: se API fallisce e c'è cache vecchia, la usa comunque

---

## Cosa NON cambia

- `ProjectCard.jsx` — invariato
- `ProjectsGrid.jsx` — invariato
- `FilterPanel.jsx` — invariato
- `FilterGroup.jsx` — invariato
- `useProjectFilters.js` — invariato (già generico, riceve array)
- `ProjectExperienceModal.jsx` — invariato
- `projectsModalConfig.js` — invariato
- **TUTTI i CSS** — invariati
- **Test esistenti** — si aggiungono solo nuovi test

---

## Cosa cambia

| File                | Modifica                                                             |
| ------------------- | -------------------------------------------------------------------- |
| `ProjectsModal.jsx` | 1 import diverso: `useGithubProjects` invece di `import projectData` |
| `projectData.js`    | **Eliminato** — sostituito da `projectsMeta.js` + `githubApi.js`     |

---

## Esclusione fork e repo indesiderati

- GitHub API restituisce `fork: true/false`
- `projectsMeta.js` supporta `exclude: true` per nascondere repo specifici
- Sono esclusi automaticamente: fork, repo archiviati, repo in `exclude`

---

## Cache

| Storage                | TTL                 | Motivo                                  |
| ---------------------- | ------------------- | --------------------------------------- |
| `localStorage`         | 30 minuti           | Resilienza offline, riduce chiamate API |
| Fallback cache scaduta | Usata se API è down | Non lasciare l'utente a secco           |

---

## Topics GitHub

- I topics vengono letti da GitHub e aggiunti a `technologies`
- `type` (frontend/backend/fullstack) e `projectScope` (personal/work) restano in `projectsMeta.js`
- Se in futuro si volesse, si possono spostare su GitHub come `type-frontend`, `scope-personal` etc.

---

## Migrazione futura a Laravel

Quando il backend Laravel sarà pronto:

1. Creare `php artisan github:sync-projects` che importa i repo nel DB
2. Creare rotta `GET /api/projects` che restituisce lo stesso formato
3. Creare `hooks/useLaravelProjects.js` con la stessa interfaccia di `useGithubProjects`
4. Cambiare **1 riga** in `ProjectsModal.jsx`: `useGithubProjects` → `useLaravelProjects`

| Campo          | ORA (GitHub API + locale)   | FUTURO (Laravel)           |
| -------------- | --------------------------- | -------------------------- |
| `id`           | nome repo (stringa)         | DB auto-increment          |
| `title`        | da GitHub                   | importato da GitHub (cron) |
| `description`  | projectsMeta.js IT          | salvato su DB (importato)  |
| `type`         | projectsMeta.js             | colonna DB                 |
| `projectScope` | projectsMeta.js             | colonna DB                 |
| `technologies` | GitHub lang + topics + meta | colonna JSON DB            |
| `stars`        | da GitHub                   | importato da GitHub (cron) |
| `updatedAt`    | da GitHub                   | importato da GitHub (cron) |
| `preview`      | placeholder                 | upload immagine futuro     |

---

## Predeploy Check

Prima di ogni deploy, eseguire lo script automatico che verifica:

| Step | Comando                                       | Blocca?                                            |
| ---- | --------------------------------------------- | -------------------------------------------------- |
| 1    | `vitest run` (JS tests)                       | ❌ Se fallisce → STOP                              |
| 2    | `php artisan test` (PHP tests)                | ❌ Se fallisce → STOP                              |
| 3    | `npm audit` + `npm audit fix`                 | ⚠️ Se HIGH/CRITICAL non fixabili → chiede conferma |
| 4    | `composer audit` + `composer update --no-dev` | ⚠️ Se HIGH/CRITICAL non fixabili → chiede conferma |

### Come eseguire

```bash
# Bash (Git Bash / macOS / Linux)
bash scripts/predeploy.sh

# PowerShell (Windows)
.\scripts\predeploy.ps1

# Oppure via npm (usa bash)
npm run predeploy
```

### Comportamento

- **Test JS/PHP falliti** → deploy bloccato, devi fixare prima
- **Vulnerabilità moderate/basse** → non bloccano, procede
- **Vulnerabilità HIGH/CRITICAL fixabili** → `npm audit fix` / `composer update` le risolve automaticamente
- **Vulnerabilità HIGH/CRITICAL non fixabili** → lo script chiede: procedere, vedere dettagli o fermare

---

## Completato il piano ✅
