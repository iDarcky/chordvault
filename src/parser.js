// Parse a .md song file into a structured object
export function parseSongMd(text) {
  const lines = text.split('\n');
  let inFrontmatter = false;
  let pastFrontmatter = false;
  const frontLines = [];
  const bodyLines = [];

  for (const line of lines) {
    if (!pastFrontmatter && line.trim() === '---') {
      if (!inFrontmatter) { inFrontmatter = true; continue; }
      else { inFrontmatter = false; pastFrontmatter = true; continue; }
    }
    if (inFrontmatter) frontLines.push(line);
    else if (pastFrontmatter) bodyLines.push(line);
    else bodyLines.push(line);
  }

  // Parse YAML frontmatter (simple key: value)
  const meta = {};
  for (const fl of frontLines) {
    const m = fl.match(/^(\w[\w\s]*?):\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
      } else if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (!isNaN(val) && val !== '') {
        val = Number(val);
      }
      meta[m[1].trim().toLowerCase()] = val;
    }
  }

  // Parse body into sections
  const sections = [];
  let current = null;
  let inTab = false;
  let tabAccum = null;

  for (const line of bodyLines) {
    const sectionMatch = line.match(/^##\s+(.+?)$/);
    if (sectionMatch) {
      if (inTab && tabAccum && current) {
        current.lines.push(tabAccum);
        inTab = false;
        tabAccum = null;
      }
      if (current) sections.push(current);
      current = { type: sectionMatch[1].trim(), note: '', lines: [] };
      continue;
    }
    // Lines starting with > are band/performance notes
    if (line.match(/^>\s*(.*)/)) {
      if (current) current.note = line.replace(/^>\s*/, '').trim();
      continue;
    }

    // Tab block detection
    const tabOpen = line.match(/^\{tab(?:,\s*(.+?))?\}$/);
    if (tabOpen) {
      inTab = true;
      const meta = tabOpen[1] || '';
      let time = null;
      const timePart = meta.match(/time:\s*(\S+)/);
      if (timePart) time = timePart[1];
      tabAccum = { type: 'tab', strings: [], time, raw: [] };
      continue;
    }
    if (inTab && line.trim() === '{/tab}') {
      if (current && tabAccum) current.lines.push(tabAccum);
      inTab = false;
      tabAccum = null;
      continue;
    }
    if (inTab && tabAccum) {
      const strMatch = line.match(/^([eBGDAE])\|(.+)$/);
      if (strMatch) {
        tabAccum.strings.push({ note: strMatch[1], content: strMatch[2] });
      }
      tabAccum.raw.push(line);
      continue;
    }

    // Modulate marker detection
    const modMatch = line.match(/^\{modulate:\s*([+-]?\d+)\}$/);
    if (modMatch) {
      if (current) current.lines.push({ type: 'modulate', semitones: parseInt(modMatch[1], 10) });
      continue;
    }

    if (current) current.lines.push(line);
  }
  if (inTab && tabAccum && current) {
    current.lines.push(tabAccum);
  }
  if (current) sections.push(current);

  // Trim trailing empty lines from each section
  for (const s of sections) {
    while (s.lines.length) {
      const last = s.lines[s.lines.length - 1];
      if (typeof last === 'string' && !last.trim()) s.lines.pop();
      else break;
    }
  }

  return {
    title: meta.title || 'Untitled',
    artist: meta.artist || 'Unknown',
    key: meta.key || 'C',
    tempo: meta.tempo || 120,
    time: meta.time || '4/4',
    ccli: meta.ccli || '',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    spotify: meta.spotify || '',
    youtube: meta.youtube || '',
    capo: meta.capo || 0,
    notes: meta.notes || '',
    structure: meta.structure || sections.map(s => s.type),
    sections,
  };
}

// Convert a song object back to .md format
export function songToMd(song) {
  let md = '---\n';
  md += `title: ${song.title}\n`;
  md += `artist: ${song.artist}\n`;
  md += `key: ${song.key}\n`;
  md += `tempo: ${song.tempo}\n`;
  md += `time: ${song.time}\n`;
  if (song.ccli) md += `ccli: "${song.ccli}"\n`;
  if (song.tags?.length) md += `tags: [${song.tags.join(', ')}]\n`;
  if (song.spotify) md += `spotify: ${song.spotify}\n`;
  if (song.youtube) md += `youtube: ${song.youtube}\n`;
  if (song.capo) md += `capo: ${song.capo}\n`;
  if (song.notes) md += `notes: ${song.notes}\n`;
  if (song.structure?.length) {
    md += `structure: [${song.structure.join(', ')}]\n`;
  }
  md += '---\n\n';

  for (const sec of song.sections) {
    md += `## ${sec.type}\n`;
    if (sec.note) md += `> ${sec.note}\n`;
    md += sec.lines.map(l => {
      if (typeof l === 'string') return l;
      if (l.type === 'tab') return serializeTabBlock(l);
      if (l.type === 'modulate') return `{modulate: ${l.semitones > 0 ? '+' : ''}${l.semitones}}`;
      return '';
    }).join('\n') + '\n\n';
  }

  return md.trim() + '\n';
}

// Parse a lyric line into chord+text pairs
// Input:  "[A]I bring the [D]ashes"
// Output: [{chord:"A", text:"I bring the "}, {chord:"D", text:"ashes"}]
export function parseLine(line) {
  const parts = [];
  const re = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      const text = line.slice(lastIndex, match.index);
      if (parts.length > 0) {
        parts[parts.length - 1].text += text;
      } else {
        parts.push({ chord: '', text });
      }
    }
    parts.push({ chord: match[1], text: '' });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < line.length) {
    const text = line.slice(lastIndex);
    if (parts.length > 0) {
      parts[parts.length - 1].text += text;
    } else {
      parts.push({ chord: '', text });
    }
  }

  return parts;
}

// Convert a chord-annotated line to placement model
// "[C]Amazing [G]grace" → { plainText: "Amazing grace", chords: [{chord:"C",pos:0},{chord:"G",pos:8}] }
export function lineToPlacement(line) {
  const chords = [];
  const re = /\[([^\]]+)\]/g;
  let match, stripped = '', lastIndex = 0;
  while ((match = re.exec(line)) !== null) {
    stripped += line.slice(lastIndex, match.index);
    chords.push({ chord: match[1], pos: stripped.length });
    lastIndex = re.lastIndex;
  }
  stripped += line.slice(lastIndex);
  return { plainText: stripped, chords };
}
 
// Convert placement model back to chord-annotated line
// { plainText: "Amazing grace", chords: [{chord:"C",pos:0},{chord:"G",pos:8}] } → "[C]Amazing [G]grace"
export function placementToLine({ plainText, chords }) {
  const sorted = [...chords].sort((a, b) => b.pos - a.pos);
  let result = plainText;
  for (const c of sorted) {
    result = result.slice(0, c.pos) + '[' + c.chord + ']' + result.slice(c.pos);
  }
  return result;
}
 
// Serialize a tab block object back to ASCII
export function serializeTabBlock(tab) {
  // Prefer raw lines for round-trip fidelity
  if (tab.raw && tab.raw.length > 0) {
    const header = tab.time ? `{tab, time: ${tab.time}}` : '{tab}';
    return header + '\n' + tab.raw.join('\n') + '\n{/tab}';
  }
  // Generate from structured data (grid-editor-created)
  const header = tab.time ? `{tab, time: ${tab.time}}` : '{tab}';
  const lines = tab.strings.map(s => `${s.note}|${s.content}`);
  return header + '\n' + lines.join('\n') + '\n{/tab}';
}

// Parse tab string content into positioned fret data for rendering
export function parseTabPositions(content) {
  const positions = [];
  const measures = content.split('|').filter(m => m.length > 0);
  let charOffset = 0;

  for (let mi = 0; mi < measures.length; mi++) {
    const measure = measures[mi];
    let i = 0;
    while (i < measure.length) {
      const ch = measure[i];
      if (ch >= '0' && ch <= '9') {
        // Check for two-digit fret numbers (10-24)
        let fretStr = ch;
        if (i + 1 < measure.length && measure[i + 1] >= '0' && measure[i + 1] <= '9') {
          fretStr += measure[i + 1];
          i++;
        }
        const fret = parseInt(fretStr, 10);
        // Check for trailing technique marker
        let technique = null;
        if (i + 1 < measure.length) {
          const next = measure[i + 1];
          if ('hpsbx~'.includes(next) || next === '/' || next === '\\') {
            technique = next;
            i++;
          }
        }
        positions.push({ fret, pos: charOffset + i - (fretStr.length - 1), measure: mi, technique });
      }
      i++;
      charOffset;
    }
    charOffset += measure.length + 1; // +1 for the | separator
  }

  return positions;
}

// Parse raw string lines (without delimiters) into a tab object
export function parseTabBlock(rawLines) {
  const tab = { type: 'tab', strings: [], time: null, raw: [...rawLines] };
  for (const line of rawLines) {
    const m = line.match(/^([eBGDAE])\|(.+)$/);
    if (m) {
      tab.strings.push({ note: m[1], content: m[2] });
    }
  }
  return tab;
}

// Extract inline notes {!text} from a line
// Returns { clean: lineWithoutNotes, notes: ['note1', 'note2'] }
export function extractInlineNotes(line) {
  const notes = [];
  const clean = line.replace(/\{!([^}]*)\}/g, (_, text) => {
    notes.push(text.trim());
    return '';
  });
  return { clean, notes };
}

// Generate a unique ID for songs and setlists
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Frontmatter utilities ────────────────────────────────────────

// Split md into frontmatter and body parts
export function splitMd(md) {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { frontmatter: '', body: md };
  return {
    frontmatter: fmMatch[1],
    body: md.substring(fmMatch[0].length),
  };
}

// Replace frontmatter in md while preserving body exactly
export function replaceFrontmatter(md, newFrontmatter) {
  const { body } = splitMd(md);
  return `---\n${newFrontmatter}\n---${body}`;
}

// Parse frontmatter text into flat field object (strings, for form editing)
export function parseFrontmatterFields(frontmatter) {
  const fields = {
    title: '', artist: '', key: 'C', tempo: '120', time: '4/4',
    structure: '', ccli: '', tags: '', capo: '',
    spotify: '', youtube: '', notes: '',
  };
  if (!frontmatter) return fields;
  frontmatter.split('\n').forEach(line => {
    const m = line.match(/^(\w[\w\s]*?):\s*(.+)$/);
    if (m) {
      const key = m[1].trim().toLowerCase();
      let val = m[2].trim();
      // Strip brackets from arrays, quotes from strings
      if (val.startsWith('[') && val.endsWith(']')) val = val.slice(1, -1);
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (Object.hasOwn(fields, key)) fields[key] = val;
    }
  });
  return fields;
}

// Serialize field object back to frontmatter text
export function serializeFrontmatterFields(fields) {
  const lines = [];
  if (fields.title) lines.push(`title: ${fields.title}`);
  if (fields.artist) lines.push(`artist: ${fields.artist}`);
  if (fields.key) lines.push(`key: ${fields.key}`);
  if (fields.tempo) lines.push(`tempo: ${fields.tempo}`);
  if (fields.time) lines.push(`time: ${fields.time}`);
  if (fields.structure) lines.push(`structure: [${fields.structure}]`);
  if (fields.ccli) lines.push(`ccli: "${fields.ccli}"`);
  if (fields.tags) lines.push(`tags: [${fields.tags}]`);
  if (fields.capo) lines.push(`capo: ${fields.capo}`);
  if (fields.spotify) lines.push(`spotify: ${fields.spotify}`);
  if (fields.youtube) lines.push(`youtube: ${fields.youtube}`);
  if (fields.notes) lines.push(`notes: ${fields.notes}`);
  return lines.join('\n');
}
