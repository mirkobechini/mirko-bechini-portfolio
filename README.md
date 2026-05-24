# 🚀 MirkoBechini-Portfolio

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Last Commit](https://img.shields.io/github/last-commit/mirkobechini/mirko-bechini-portfolio/main?style=flat-square)](https://github.com/mirkobechini/mirko-bechini-portfolio/commits)

> Portfoglio personale interattivo con stile retrò, costruito con React e NES.css.

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

- **About me**: sezione introduttiva su di me.
- **Esperienze & Progetti**: showcase dei progetti sviluppati e delle esperienze lavorative.
- **Formazione & Competenze**: elenco delle competenze tecniche e corsi di formazione.
- **Certificazioni**: sezione dedicata alle certificazioni ottenute.
- **Contatti**: modulo di contatto o link ai social media.

---

## 🛠️ Tech Stack

| Settore              | Tecnologie                                                                                                                                                                                                                                                                                                        |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black&style=flat-square) |
| **Markup & Styling** | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=flat-square)                                                                                                                  |
| **Strumenti**        | ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white&style=flat-square) ![Google Gemini](https://img.shields.io/badge/-Gemini-4285F4?logo=google&logoColor=white&style=flat-square)                                                                                                           |

### Frameworks e Librerie

- **React Router**: Navigazione fluida tra le sezioni del portfolio.
- **NES.css**: Stile retrò per un look unico e accattivante.

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
# Esempio Node
npm run dev

```

Apri il browser su `http://localhost:5173` (o la porta indicata dal progetto).

---

## 📂 Struttura del progetto

```text
.
├── public/
│   ├── assets/
│   │   ├── backgrounds/
│   │   │   └── den.png
│   │   ├── modals/
│   │   │   ├── about-me/
│   │   │   ├── certifications/
│   │   │   ├── contacts/
│   │   │   ├── projects/
│   │   │   └── skills/
│   │   │       ├── icons/
│   │   │       └── modal/
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
│   │   ├── educationData.js
│   │   ├── ModalData.jsx
│   │   ├── projectData.js
│   │   └── skillsData.js
│   ├── pages/
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

### Unita consigliate

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
- [x] Creazione del layout principale
- [x] Header e Footer
- [x] Struttura pagina Home
- [x] CSS pagina home
- [x] Modale base
- [x] Refactoring codice e ottimizzazione performance
- [x] Modale "About me"
- [x] Modale "Formazione & Competenze"
- [x] Modale "Esperienze & Progetti"
- [x] Modale "Contatti"
- [x] Refactoring codice e ottimizzazione performance
- [x] Aggiunta contenuti e immagini
- [x] Styling e design con NES.css
- [x] Animazioni e transizioni
- [x] Aggiunta funzionalità di filtro per progetti
- [x] CSS bordi laterali per migliorare l'esperienza utente

### In sviluppo

- [ ] Restyle modale "Esperienze & Progetti"
- [ ] Restyle modale "Formazione & Competenze"
- [ ] Restyle modale "Contatti"
- [x] Restyle modale "About me"
- [ ] Navigazione da tastiera e miglioramento accessibilità (A11y)
- [ ] Ottimizzazione codice e performance

### Migliorie future

- [ ] Loader per migliorare l'esperienza utente
- [ ] Migliora animazioni e transizioni
- [ ] Minor restyle
- [ ] Miglioramento accessibilità (A11y)
- [ ] Responsive design
- [ ] Integrazione API esterna

---

## 📧 Contatti

Se vuoi metterti in contatto con me, puoi trovarmi qui:

- **Email**: mirkobechini@gmail.com
- **LinkedIn**: [Mirko Bechini](https://www.linkedin.com/in/mirko-bechini-892202252)
- **Repository del progetto**: [GitHub](https://github.com/mirkobechini/mirko-bechini-portfolio)
