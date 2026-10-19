# Piano futuro: backend Laravel + Filament

Documento di pianificazione. Aggiornalo man mano che le decisioni vengono prese e le fasi completate.

## Dove siamo

Già fatto e in produzione (o pronto nel branch `dev`):

- Progetti letti da `/api/projects` (`projectsApi.js` → `projectMapper.js` → `useProjects` → `ProjectsModal`), con cache in `localStorage` e fallback statico. Il backend li sincronizza da GitHub.
- **Tutte le sezioni leggono dal backend** (fasi 1-6 completate in `dev`, non ancora in `main`): progetti, competenze, formazione, certificazioni e contatti hanno tabella, risorsa Filament in `/admin`, endpoint `/api/*` (cache 10 min, ETag, throttle) e un hook del sito (`useProjects`, `useSkills`, `useCourses`, `useCertifications`, `useContacts`, tutti su `useApiList`). I file `*Data.js` restano solo come ultimo fallback e come sorgente dei seeder.
- Anche i passi "Percorso e prossimi step" (focus attuale e roadmap del libro Formazione) stanno nel database (`formation_steps`, `/api/formation-steps`, risorsa "Percorso e prossimi step"); i corsi si mostrano dal più recente al più vecchio.
- Attestati da PDF (2026-10-19): si carica un PDF nel pannello e sul sito resta solo l'immagine della prima pagina (il PDF non si conserva). Conversione tramite il backend di PdfEditor, dietro l'interfaccia `PdfPreviewConverter` (alternativa possibile: Imagick + Ghostscript, se Laravel Cloud avrà Ghostscript).
- Collegamenti: progetto ↔ skill (tabella ponte), progetto → corso (`course_id`), certificazione → corso (`course_id`). Corsi e certificazioni citano le skill per nome e seguono rinomini ed eliminazioni (`SkillNameReferences`).
- Upload delle immagini dal pannello fatto per icone delle skill, attestati dei corsi, immagini delle certificazioni e anteprime dei progetti (colonne `*_upload` che hanno la precedenza sul percorso/URL scritto a mano; disco `UPLOADS_DISK`). Le anteprime dei progetti compaiono sulla card solo se caricate.
- Da fare: checklist di deploy qui sotto, poi il merge su `main` solo con il via esplicito.
- Backend Laravel 13 minimale (aggiornato da 12 il 2026-10-11): serve l'SPA, 404 reale, header di sicurezza (CSP attiva dal 2026-10-14), `trustProxies`.
- Test (Vitest ~370, PHPUnit), CI con lint/test/build, `npm run predeploy`, 0 vulnerabilità note.

**Cosa non va bene oggi, e perché serve un backend:**

1. Per cambiare una descrizione, una skill o un corso devi modificare il codice e fare un deploy (`projectsMeta.js`, `skillsData.js`, `educationData.js`, `certificationData.js`, `contactsData.js`).
2. Il browser chiama GitHub direttamente: limite di **60 richieste/ora per IP** senza token, e ogni visitatore rifà la stessa chiamata.
3. Le anteprime dei progetti sono un segnaposto (caricare immagini è stato rimandato, vedi le decisioni).

## Obiettivo

Un pannello `/admin` (Filament) per aggiornare i contenuti senza deploy, e un'API in sola lettura che il frontend React consuma. I dati attuali restano nel bundle come **fallback**, quindi il sito funziona anche se l'API non risponde.

```
Pannello /admin (Filament, login)
        │ scrive
        ▼
     Database ◄── php artisan github:sync-projects (scheduler, token GitHub)
        │ legge
        ▼
  GET /api/projects, /api/skills, ...   (cache + throttle)
        │
        ▼
  React: useProjects / useSkills ...    (se l'API fallisce → dati statici)
```

## Decisioni prese (2026-10-11)

| # | Domanda | Decisione |
|---|---|---|
| 1 | Quali contenuti gestire da pannello? | **Tutti e quattro**, a fasi: **progetti** per primi, poi competenze, formazione e certificazioni, contatti. |
| 2 | Database | **MySQL** in produzione su Laravel Cloud (come `CV_Backoffice`; da verificare nel pannello se si può riusare lo stesso cluster con un database separato). **SQLite** in locale. Le migrazioni restano portabili. In produzione SQLite non va bene: il disco di Cloud si azzera a ogni deploy. |
| 3 | Anteprime dei progetti | **Rimandate**: resta il segnaposto di oggi. Niente upload né storage per ora. |
| 4 | Sync GitHub | Il sync aggiorna **solo i campi di GitHub** (stelle, data dell'ultimo push, URL, linguaggio e topics in `technologies`). Titolo, descrizione in italiano, tipo, scope, sito online, tecnologie aggiuntive, in evidenza e nascosto restano sempre quelli del pannello: il sync imposta il titolo (dal nome del repo) solo quando crea un progetto nuovo, altrimenti si perderebbero titoli come "Gods Backoffice". Il pannello non permette di eliminare i progetti (il sync li ricreerebbe): per toglierne uno dal sito si usa "Nascosto". |
| 5 | Accesso e indirizzo | **Un solo utente (tu), con 2FA obbligatoria**, creato da comando: nessuna registrazione pubblica. Pannello su **`/admin`**. |
| 6 | Categorie e ambiti dei progetti | **Valori fissi, come enum nel codice** (`ProjectType`: frontend/backend/fullstack, `ProjectScope`: personal/work), non tabelle: il sito React ha un'icona e un'etichetta per ciascuno. Un test confronta gli enum con `useProjectFilters.js`. |
| 7 | Raggruppamenti | Tabella **`project_groups`** (es. "Cliente A", "Azienda B"): un progetto appartiene a un solo raggruppamento (opzionale), creabile dal pannello. Il sito React userà i raggruppamenti nella fase 5. |
| 8 | Collegamento progetto → corso | **Fase 6**, non prima: oggi nei dati non esiste (il corso ha solo una lista di competenze in testo e `skillsData.relatedProjects` sono nomi scritti a mano che non coincidono con i titoli). Con le tabelle `educations` e `skills`: `projects.education_id` (un progetto è nato per un corso) e relazione progetti ↔ competenze al posto di `relatedProjects`, con una migrazione che mappa i nomi attuali sui progetti veri. |
| 9 | Sincronizzazione GitHub: frequenza | **Modificabile dal pannello** (Manuale / ogni giorno / ogni settimana / ogni 2 settimane / ogni mese), partenza **ogni settimana**. Lo scheduler controlla ogni ora e il comando `github:sync-projects` parte solo se è "scaduto"; pulsante "Sincronizza ora" e stato dell'ultima esecuzione nel pannello. Token GitHub fine-grained a sola lettura (`GITHUB_TOKEN`); senza token il sync funziona comunque, col limite di 60 richieste/ora. |
| 10 | Sincronizzazione GitHub: repo nuovi e repo spariti | Un repo **nuovo** viene creato **nascosto** (da rivedere nel pannello: descrizione, categoria, ambito, poi si toglie "Nascosto"). Un progetto il cui repo **non si trova più** (cancellato, privato, archiviato) **si lascia com'è**: restano gli ultimi dati noti e "ultima sincronizzazione" invecchia. Fork e repo archiviati non si importano. |

Riferimento: `portfolio-chicca` usa già **Filament 5** (5.10 al 2026-10-11) con Laravel 13 e PHP 8.4: per questo progetto vale Filament 5, non la 4.

## Modello dati (bozza)

Ogni tabella ricalca i campi dei file `*Data.js` attuali, così il seeder può importarli così come sono.

- **projects**: `github_repo` (unico), `title`, `description_it`, `type`, `scope`, `technologies` (json), `repo_url`, `live_url`, `preview_path`, `stars`, `pushed_at`, `pinned`, `hidden`, `synced_at`.
- **skills**: `name`, `icon_path`, `category`, `color`, `functions` (json), `related_projects` (json), `sort`.
- **education**, **certifications**, **contacts**: campi come nei rispettivi `*Data.js`, più `sort` e `visible`.

## API (sola lettura)

- `GET /api/projects`, `/api/skills`, `/api/education`, `/api/certifications`, `/api/contacts`: JSON nello **stesso formato** che i componenti React ricevono oggi (nessun cambio ai componenti di presentazione).
- Cache lato server (es. 10 min, invalidata a ogni salvataggio dal pannello), `throttle`, `Cache-Control` per Cloudflare.
- Le URL `api/*` sconosciute devono rispondere **404 in JSON** (oggi il fallback serve l'SPA: va aggiunto un ramo per `api/*` in `routes/web.php`). I test `test_api` e `test_api_notFound` in `RoutesTest` sono già lì a proteggere questo comportamento.

## Frontend

- Nuovo hook `useProjects` con la stessa interfaccia di `useGithubProjects` (`{ projects, loading, error, refetch }`): in `ProjectsModal` cambia **una riga**. Stessa cosa per le altre sezioni.
- Ordine di fallback: API → cache `localStorage` (anche scaduta, `getStale()`) → dati statici nel bundle.
- Solo a questo punto ha senso introdurre un livello "repository" con più sorgenti (API, locale): prima c'è una sola implementazione e sarebbe indirezione inutile.

## Sicurezza e infrastruttura: cose che cambiano

- **Sessioni:** Filament richiede sessioni funzionanti. Oggi in produzione `SESSION_DRIVER=cookie`: verificare che basti, oppure passare a `database` (ora c'è un DB).
- **CSP:** il middleware `SecurityHeaders` deve **escludere `/admin`**: Livewire e Alpine usano script inline e `eval`, la CSP del sito li bloccherebbe. Test dedicato.
- **Cache e code:** `CACHE_STORE`/`QUEUE_CONNECTION` da rivedere (la cache API conviene su un driver condiviso).
- **Scheduler:** `github:sync-projects` ogni ora (o meno). Su Laravel Cloud serve attivare lo scheduler.
- **Token GitHub:** variabile `GITHUB_TOKEN` (permessi di sola lettura sui repo pubblici) per superare il limite di 60/h. Mai nel repo.
- **Deploy:** aggiungere `php artisan migrate --force` ai comandi di deploy; il `.env.production` locale va aggiornato con le nuove variabili.
- **Admin:** URL non standard o limitazione per IP/Cloudflare Access come difesa in più (facoltativo), 2FA obbligatoria, `APP_DEBUG=false`.

## Fasi proposte

Una branch per fase (`feat/...`), merge in `dev` con `--no-ff`, test verdi prima di ogni merge.

1. **Fondamenta**: database (SQLite in locale, MySQL in produzione), migrazione e modello `Project`, seeder dai dati attuali (`projectsMeta.js` + `fallbackProjects.js`), test dei modelli.
2. **Filament**: installazione, utente admin, risorsa `Project` (elenco, modifica, nascondi/fissa), 2FA, esclusione di `/admin` dalla CSP + test.
3. **Sync GitHub**: comando `github:sync-projects` (+ test con `Http::fake`), scheduler, token.
4. **API progetti**: endpoint, cache con invalidazione, throttle, 404 JSON per `api/*`, test Feature.
5. **Frontend progetti**: `useProjects` con fallback, test (stile `useGithubProjects.test.jsx`), rimozione della chiamata diretta a GitHub dal browser.
6. **Altre sezioni**: skills, education, certifications, contacts, ognuna con migrazione, risorsa Filament, endpoint e hook (una fase per sezione). L'upload delle immagini resta fuori finché non viene ripreso.
7. **Pulizia**: togliere i file `*Data.js` solo se i fallback non servono più (probabilmente conviene tenerli), aggiornare README e questo documento.

## Checklist di deploy (da fare UNA volta, quando il backend è finito)

Niente di questo è stato ancora fatto in produzione: `main` e Laravel Cloud sono fermi alla versione senza backend.

1. **Database**: creare il database MySQL su Laravel Cloud e collegarlo all'app (variabili `DB_*`).
2. **Migrazioni**: aggiungere `php artisan migrate --force` ai comandi di deploy.
3. **Disco per le icone caricate**: il filesystem di Laravel Cloud non è persistente (si azzera a ogni deploy), quindi creare un bucket di Object Storage, collegarlo all'app e impostare `UPLOADS_DISK` sul nome del suo disco (verificare i passaggi nella documentazione di Laravel Cloud). Con `UPLOADS_DISK=public` le icone andrebbero perse al deploy successivo. Le icone predefinite (percorsi in `public/assets`) non sono interessate.
4. **Cache condivisa**: impostare `CACHE_STORE=database` (o redis). Con la cache su file e più istanze, l'API pubblica può restare vecchia fino a 10 minuti dopo una modifica dal pannello, perché ogni istanza svuota solo la propria cache. Serve anche la tabella `cache` (migrazione già presente).
5. **Sessioni**: decidere `SESSION_DRIVER` (oggi `cookie`; Filament funziona meglio con `database`).
6. **Scheduler**: attivare lo scheduler di Laravel Cloud (esegue `github:sync-projects` ogni ora; il comando parte solo se la frequenza scelta lo richiede).
7. **Token GitHub**: creare il token fine-grained (sola lettura, repo pubblici) e impostare `GITHUB_TOKEN` solo nelle variabili d'ambiente di Laravel Cloud e nel `.env` locale. Mai in chat o nel repo.
8. **Utente admin**: crearlo con i Cloud Commands (`php artisan make:filament-user`, poi `is_admin = 1`) e configurare subito la 2FA e salvare i codici di recupero.
9. **Primo popolamento**: lanciare `php artisan db:seed` (progetti, competenze, corsi, certificazioni, contatti) e poi "Sincronizza ora" dal pannello; controllare `/api/projects`.
10. **Variabili** *(fatto: vedi `.env.production.example`, controllato da `npm run predeploy`)*: `CACHE_STORE`, `SESSION_DRIVER`, `UPLOADS_DISK`, `GITHUB_USERNAME`; il token solo su Cloud; `APP_DEBUG=false`; PHP 8.5 è già impostato.
11. **CSP** *(fatto il 2026-10-14: verificata sul sito vero con un browser automatico, nessuna violazione; ora blocca; `SECURITY_CSP_MODE=report-only` per tornare indietro)*.
12. **Cloudflare**: verificare che `/api/*` non venga messo in cache oltre i `Cache-Control` inviati e che `/admin` non sia in cache.
13. **Merge su main**: solo con il via esplicito (PR #41 dev → main), poi controllare `/`, `/admin`, `/api/projects` e il login con 2FA.

## Rischi e punti di attenzione

- **Dipendere dall'API per il primo caricamento** rallenta la home se l'API è lenta: il fallback statico e la cache devono coprire, e le chiamate partono solo all'apertura della modal (come ora).
- **Doppia fonte di verità** (file `*Data.js` e DB): decidere subito che il DB è la fonte e i file sono solo fallback, e prevedere un modo per tenerli allineati (es. un comando che esporta il DB nei file).
- **Costi e limiti** di database e storage su Laravel Cloud: da verificare prima di scegliere il piano.
- **Aggiornamenti di Filament** a versioni major: seguire le note di rilascio, non aggiornare alla cieca.
