// Export a setlist to a print-friendly PDF via a popup window.
//
// The popup offers two modes via a "Mode" segmented control:
//   - Order:  cover page only — setlist name, date/time/location, tags, and
//             the numbered set order (songs + break dividers). Useful for a
//             one-page run-sheet to hand the band.
//   - Full:   cover page + every song's full chord chart, separated by page
//             breaks. Breaks render as inline dividers between songs.
//
// Both modes are rendered upfront; switching between them is a CSS class
// toggle on <body>, so the live preview flips instantly with no re-render.

import { transposeKey } from '../music';
import { renderSongCover, renderSongBody, escapeHtml } from './renderers';
import { buildPdfDocument, openPrintWindow, readInitialPrefs } from './pdfDocument';

function formatDate(setlist) {
  if (!setlist.date) return '';
  try {
    const d = new Date(setlist.date + 'T' + (setlist.time || '12:00') + ':00');
    if (isNaN(d.getTime())) return setlist.date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch {
    return setlist.date;
  }
}

function formatTime(setlist) {
  if (!setlist.time) return '';
  try {
    return new Date(`1970-01-01T${setlist.time}`).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: 'numeric',
    });
  } catch {
    return setlist.time;
  }
}

function renderSetlistCover(setlist, items) {
  const dateStr = formatDate(setlist);
  const timeStr = formatTime(setlist);

  const songCount  = items.filter(it => !it.isBreak).length;
  const breakCount = items.filter(it => it.isBreak).length;
  const totalMin   = items.reduce((sum, it) => sum + (it.isBreak ? (it.duration || 0) : 0), 0);

  const metaBits = [];
  if (dateStr) metaBits.push(`<strong>${escapeHtml(dateStr)}</strong>`);
  if (timeStr) metaBits.push(escapeHtml(timeStr));
  if (setlist.location) metaBits.push(escapeHtml(setlist.location));
  const metaHtml = metaBits.join('<span class="sep">·</span>');

  const tagList = setlist.tags?.length ? setlist.tags : (setlist.service ? [setlist.service] : []);
  const tagsHtml = tagList.length
    ? `<div class="cover-tags">${tagList.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const summaryBits = [];
  summaryBits.push(`${songCount} song${songCount === 1 ? '' : 's'}`);
  if (breakCount > 0) summaryBits.push(`${breakCount} break${breakCount === 1 ? '' : 's'}`);
  if (totalMin > 0) summaryBits.push(`~${totalMin} min of breaks`);
  const summary = summaryBits.join(' · ');

  return `
    <header class="cover">
      <h1>${escapeHtml(setlist.name || 'Untitled Setlist')}</h1>
      ${metaHtml ? `<div class="setlist-meta">${metaHtml}</div>` : ''}
      ${tagsHtml}
      <div class="cover-aux"><strong>Set</strong> ${escapeHtml(summary)}</div>
    </header>
    <section class="set-order">
      <h2 style="font-size: 11pt; text-transform: uppercase; letter-spacing: 0.14em; color: #444; margin: 0 0 10px;">Set Order</h2>
      <ol class="order-list">
        ${renderOrderList(items)}
      </ol>
    </section>`;
}

function renderOrderList(items) {
  let songNum = 0;
  return items.map(it => {
    if (it.isBreak) {
      const dur = (it.duration || 0) > 0 ? `<span class="break-dur">· ${it.duration} min</span>` : '';
      return `
        <li class="order-break">
          <span class="break-rule"></span>
          <span class="break-label">${escapeHtml(it.label || 'Break')}</span>
          ${dur}
          <span class="break-rule"></span>
        </li>`;
    }
    songNum += 1;
    const num = String(songNum).padStart(2, '0');
    const displayKey = transposeKey(it.song.key, it.transpose);
    const capoBit = it.capo ? `<span style="font-size:8.5pt;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-right:6px;">capo ${it.capo}</span>` : '';
    const tempoBit = it.song.tempo ? `${it.song.tempo} BPM` : '';
    return `
      <li class="order-row">
        <span class="order-num">${num}</span>
        <span class="order-title">
          ${escapeHtml(it.song.title || 'Untitled')}
          ${it.song.artist ? `<span class="order-artist">${escapeHtml(it.song.artist)}</span>` : ''}
        </span>
        ${capoBit}
        <span class="order-key">${escapeHtml(displayKey)}</span>
        <span class="order-tempo">${escapeHtml(tempoBit)}</span>
      </li>`;
  }).join('');
}

function renderBreakDivider(item) {
  const dur = (item.duration || 0) > 0 ? `<span class="break-dur">${item.duration} min</span>` : '';
  return `
    <div class="break-divider">
      <span class="break-rule"></span>
      <span class="break-label">${escapeHtml(item.label || 'Break')}</span>
      ${dur}
      <span class="break-rule"></span>
    </div>`;
}

function renderSongChart(item) {
  const song = item.song;
  return `
    <article class="song-chart">
      <header class="cover">
        ${renderSongCover(song, item.transpose)}
      </header>
      <main>
        ${renderSongBody(song, item.transpose)}
      </main>
    </article>`;
}

export function exportSetlistPdf(setlist, songs, opts = {}) {
  if (!setlist) return;

  // Resolve song references and tag breaks for easier downstream rendering.
  const items = (setlist.items || []).map(item => {
    if (item.type === 'break') {
      return {
        isBreak: true,
        label: item.label || 'Break',
        note: item.note || '',
        duration: item.duration || 0,
      };
    }
    const song = songs.find(s => s.id === item.songId);
    if (!song) return null;
    return {
      isBreak: false,
      song,
      transpose: item.transpose || 0,
      capo: item.capo || 0,
      note: item.note || '',
    };
  }).filter(Boolean);

  if (items.length === 0) {
    alert('This setlist has no playable items to export.');
    return;
  }

  // Full-mode body: per-song chart pages with break dividers between them.
  const fullBody = items.map(it => it.isBreak
    ? renderBreakDivider(it)
    : renderSongChart(it)
  ).join('');

  const bodyHtml = `
    <div class="order-only">
      ${renderSetlistCover(setlist, items)}
    </div>
    <div class="full-only">
      ${renderSetlistCover(setlist, items)}
      ${fullBody}
    </div>`;

  // Default to "full" so the user gets the full-charts experience unless
  // they actively pick "order only" — that pref then sticks.
  const initialPrefs = { mode: 'full', ...readInitialPrefs(), ...(opts.prefs || {}) };

  const html = buildPdfDocument({
    title: escapeHtml(setlist.name || 'Setlist'),
    bodyHtml,
    initialPrefs,
    modes: [
      { value: 'order', label: 'Order' },
      { value: 'full',  label: 'Full' },
    ],
  });

  openPrintWindow(html);
}
