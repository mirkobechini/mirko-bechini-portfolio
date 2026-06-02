# 🚀 MirkoBechini-Portfolio

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Last Commit](https://img.shields.io/github/last-commit/mirkobechini/mirko-bechini-portfolio/main?style=flat-square)](https://github.com/mirkobechini/mirko-bechini-portfolio/commits)

> Portfolio personale interattivo con stile retrò, costruito con React, Vite e NES.css.

![Banner o Screenshot](./readmeAssets/preview.png)

---

## 📑 Indice

- [Demo](#-demo)
- [Caratteristiche principali](#-caratteristiche-principali)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Struttura del progetto](#-struttura-del-progetto)
- [Roadmap](#️-roadmap)
- [Contatti](#-contatti)

---

## 🌍 Demo

- Live: In arrivo...
  ![Preview GIF](./readmeAssets/preview-gif.gif)

---

## 🌟 Caratteristiche principali

- **Home interattiva a scena unica**: navigazione tramite sprite cliccabili in un ambiente retrò.
- **Modali tematiche**: sezioni dedicate a About Me, Formazione & Competenze, Esperienze & Progetti, Certificazioni e Contatti.
- **Gestione stato globale**: apertura/chiusura modali via Context API.
- **Preload immagini**: caricamento anticipato degli asset per migliorare la percezione di fluidità.
- **Navigazione drag/touch**: esplorazione orizzontale della scena con mouse e dispositivi touch.

---

## 🛠️ Tech Stack

| Settore              | Tecnologie                                                                                                                                                                                                                                                                                                        |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black&style=flat-square) |
| **Markup & Styling** | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=flat-square)                                                                                                                  |
| **Strumenti**        | ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white&style=flat-square) ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square) ![Google Gemini](https://img.shields.io/badge/-Gemini-4285F4?logo=google&logoColor=white&style=flat-square) ![GitHub Copilot](https://img.shields.io/badge/-GitHub%20Copilot-181717?logo=githubcopilot&logoColor=white&style=flat-square) |

### Frameworks e Librerie

- **React Router DOM**: Gestione routing client-side.
- **NES.css**: Stile retrò per UI e componenti.
- **vite-plugin-image-optimizer**: Ottimizzazione immagini in fase di build.

---

## 🚀 Quick Start

### Requisiti

Prima di iniziare, assicurati di avere installato:

- Node.js (v18+)
- Un package manager (npm, pnpm, yarn)

### Installazione

```bash
# Clona il repository
git clone https://github.com/mirkobechini/mirko-bechini-portfolio.git

# Entra nella cartella del progetto
cd mirko-bechini-portfolio

# Installa le dipendenze
npm install

```

### Avvio

```bash
# Avvio ambiente di sviluppo
npm run dev

# Lint del codice
npm run lint

# Build produzione
npm run build

# Anteprima build locale
npm run preview

```

Apri il browser su `http://localhost:5173` (o la porta indicata dal progetto).

---

## 📂 Struttura del progetto

```text
.
├── public/
│   ├── assets/
│   │   ├── _tmp-unused/
│   │   │   └── 2026-05-29/
│   │   ├── backgrounds/
│   │   ├── modals/
│   │   │   ├── about-me/
│   │   │   ├── bookshelf/
│   │   │   ├── certifications/
│   │   │   ├── contacts/
│   │   │   ├── projects/
│   │   │   └── skills/
│   │   │       ├── icons/
│   │   │       └── ui/
│   │   └── sprites/
├── readmeAssets/
│   ├── preview-gif.gif
│   └── preview.png
├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   │       ├── modals/
│   │       └── modalsCss/
│   ├── context/
│   ├── data/
│   │   ├── modals/
│   │   ├── certificationData.js
│   │   ├── contactsData.js
│   │   ├── educationData.js
│   │   ├── ModalData.jsx
│   │   ├── projectData.js
│   │   ├── skillsData.js
│   │   └── uiConstants.js
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
└── README.md
```

---

## 📐 Convenzioni CSS Responsive

### Unità consigliate

- `px`: da usare solo per dettagli pixel-art o bordi sprite che devono restare precisi.
- `rem`: unita principale per spaziature e tipografia coerenti su tutto il progetto.
- `em`: utile per componenti locali legati al font-size del parent.
- `%`: ideale per dimensioni dipendenti dal contenitore.
- `vw` / `vh`: utile per elementi legati direttamente alla viewport.
- `clamp(min, ideal, max)`: scelta preferita per dimensioni fluide con limiti controllati.

### Scala token (design tokens)

I token globali sono definiti in [src/index.css](src/index.css) dentro `:root`:

- Spaziature: `--space-3xs` ... `--space-3xl`
- Tipografia: `--text-xs`, `--text-sm`, `--text-md`, `--text-lg`, `--text-xl`
- Icone: `--icon-sm`, `--icon-md`, `--icon-lg`
- Radius: `--radius-sm`

### Regole pratiche

- Preferire sempre token globali invece di valori hardcoded.
- Evitare nuovi `px` per `margin`, `padding`, `gap` e `font-size`.
- Usare `clamp(...)` nei token, non sparso nei componenti (salvo casi specifici).
- Mantenere `px` per `border-image-slice` e parti retro/pixel-sensitive.

---

## 🗺️ Roadmap

### Completato

- [x] Integrazione di React Router
- [x] Struttura pagina Home con background interattivo
- [x] Modale base e gestione apertura/chiusura sezioni
- [x] Modale "About Me"
- [x] Modale "Formazione & Competenze"
- [x] Modale "Esperienze & Progetti"
- [x] Modale "Certificazioni"
- [x] Modale "Contatti"
- [x] Gestione stato globale con Context
- [x] Preload immagini principali
- [x] Styling e design retrò con NES.css
- [x] Gestione drag e touch della scena
- [x] Restyle modale "Formazione & Competenze"
- [x] Restyle modale "Contatti"
- [x] Restyle modale "About Me"

### In sviluppo

- [ ] Restyle modale "Esperienze & Progetti" (add experiences)
- [ ] Navigazione da tastiera
- [ ] Ottimizzazione codice e performance
- [ ] Riorganizzazione struttura cartelle e componenti

### Migliorie future

- [ ] Responsive design
- [ ] Miglioramento accessibilità (A11y)
- [ ] Aggiunta animazioni e transizioni
- [ ] Refinement visuale generale
- [ ] Integrazione API esterna
- [ ] Loader per migliorare l'esperienza utente

---

## 📧 Contatti

Se vuoi metterti in contatto con me, puoi trovarmi qui:

- **Email**: mirkobechini@gmail.com
- **LinkedIn**: [Mirko Bechini](https://www.linkedin.com/in/mirko-bechini-892202252)
- **Repository del progetto**: [GitHub](https://github.com/mirkobechini/mirko-bechini-portfolio)
