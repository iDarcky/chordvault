# Setlists MD

Setlists MD is a free, offline-first Progressive Web App (PWA) that replaces paper chord charts and scattered PDFs for worship teams and musicians. It renders beautiful, dynamic chord charts from simple `.md` (Markdown) files.

---

## 📖 Documentation

If you are a user looking to learn more about the app, or comparing it to other tools, check out our documentation folder:

* **[The Pitch](docs/pitch.md):** Why you need this app.
* **[How-To Guide](docs/how-to-guide.md):** From quick-start to mastering advanced features.
* **[Setlists MD vs. Planning Center](docs/vs-planning-center.md):** A competitive comparison.
* **[Product Specification](docs/product-spec.md):** Deep dive into the technical architecture and roadmap.
* **[Feasibility Analysis](docs/feasibility-analysis.md):** Current state of the codebase and market positioning.

---

## 🛠️ Technical Overview

### Stack
* **Vite + React:** Static Single Page Application (SPA). No backend server required for core functionality.
* **Tailwind CSS v4 + HeroUI v3:** For styling and component library.
* **idb-keyval:** IndexedDB wrapper for persistent, offline-first local storage.
* **vite-plugin-pwa:** Provides the service worker and manifest making the app installable and usable completely offline.
* **Hosting:** Designed to be hosted for free on static providers like Vercel or Netlify.

### Data Model
All data lives locally in the browser's IndexedDB. Songs are stored as JSON representations of parsed Markdown files.
Users can optionally sync their local IndexedDB with their own personal cloud storage (Google Drive, Dropbox, OneDrive) via the built-in sync engine adapters.

---

## 💻 Local Development Setup

To run Setlists MD locally, you need Node.js installed.

1. **Clone the repository:**
   `git clone <repository-url>`
   `cd setlists-md`

2. **Install dependencies:**
   `npm install`

3. **Run the development server:**
   `npm run dev &`
   This will start the Vite dev server, typically at `http://localhost:5173`.

4. **Build for production:**
   `npm run build`
   This will generate static files in the `dist` directory.

5. **Lint the code:**
   `npm run lint`

---
