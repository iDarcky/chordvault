// Export a single song to a print-friendly PDF via a popup window.
//
// The cover header, the chord-above-lyric body, and the live layout controls
// are all shared with exportSetlistPdf via renderers.js + pdfDocument.js.

import { renderSongCover, renderSongBody, escapeHtml } from './renderers';
import { buildPdfDocument, openPrintWindow, readInitialPrefs } from './pdfDocument';

export function exportSongPdf(song, opts = {}) {
  if (!song) return;
  const transpose = Number.isFinite(opts.transpose) ? opts.transpose : 0;

  const titleSafe  = escapeHtml(song.title || 'Untitled');
  const artistSafe = escapeHtml(song.artist || '');
  // Drives the popup's <title> — Chrome uses this as the suggested PDF filename.
  const docTitle = artistSafe ? `${titleSafe} — ${artistSafe}` : titleSafe;

  const bodyHtml = `
    <header class="cover">
      ${renderSongCover(song, transpose)}
    </header>
    <main>
      ${renderSongBody(song, transpose)}
    </main>`;

  const html = buildPdfDocument({
    title: docTitle,
    bodyHtml,
    initialPrefs: readInitialPrefs(),
  });

  openPrintWindow(html);
}
