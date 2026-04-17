# Architecture & Technical Overview

This document outlines the technical architecture of Setlists MD to help developers understand how the system fits together.

## 1. High-Level Architecture
Setlists MD is a **Progressive Web App (PWA)** built with React and Vite. It is an "Offline-First" application. This means:
* The core application logic and rendering engine are downloaded to the user's browser via a Service Worker.
* All data is stored locally first.
* A server backend is *not* required to use the core features of the app.

## 2. The Storage Layer
We use `idb-keyval` (a lightweight wrapper around IndexedDB) for all local storage.
* `src/storage.js` manages the keys:
  * `chordvault:songs`: Array of JSON song objects.
  * `chordvault:setlists`: Array of JSON setlist objects.
  * `chordvault:settings`: User preferences.

**Why IndexedDB?** It offers much larger storage limits than `localStorage` and supports asynchronous operations, preventing UI blocking when loading large song libraries.

## 3. The Parser Engine (`src/parser.js`)
This is the heart of the application. It converts raw Markdown strings into structured JSON that the React components can render, and vice versa.

### `parseSongMd(text)`
Takes raw markdown and returns a structured object:
```javascript
{
  title: "Amazing Grace",
  artist: "Traditional",
  key: "G",
  sections: [
    {
      type: "Verse 1",
      lines: [
        "Amazing grace how sweet the sound..." // with inline chords
      ]
    }
  ]
}
```
* **Frontmatter:** Handled by regex to extract YAML-like metadata (Title, Key, Tempo).
* **Sections:** Split by `##`.
* **Chords:** Kept inline within the text as `[Chord]` tokens. The renderer (`ChartView.jsx`) splits the string by these tokens to align them visually above the lyrics.

### `songToMd(song)`
The reverse operation. Takes the JSON object and reconstructs the valid `.md` string.

## 4. The Sync Engine (`src/sync/`)
Because browser storage can be volatile (especially on Safari, which may clear IndexedDB after 7 days of inactivity), we offer optional Cloud Sync.

* **Adapters (`sync/adapters/`):** We use a common interface for Google Drive, Dropbox, and OneDrive. These adapters handle the OAuth flow and direct API calls to read/write files to a specific `Setlists MD` folder in the user's cloud.
* **The Engine (`sync/engine.js`):** Handles the logic of comparing local `updatedAt` timestamps against remote file modified dates to resolve conflicts (Last-Write-Wins strategy).

## 5. UI & Component Library
* **Tailwind CSS v4:** Used for utility-first styling.
* **HeroUI v3:** Provides the accessible, styled baseline components (Cards, Buttons, Modals, Dropdowns).
* **State Management:** Currently relies on React Context and standard state lifting (mostly centralized in `App.jsx` passing props down).

## 6. Music Logic (`src/music.js`)
Contains the logic for transposing chords, calculating Capo shapes, and converting standard chords to the Nashville Number System. It uses arrays of scale degrees and regex to safely dissect a chord (e.g., `F#m7/C#`) into its root, suffix, and bass note, transpose them individually, and reassemble them.
