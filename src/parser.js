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

  for (const line of bodyLines) {
    const sectionMatch = line.match(/^##\s+(.+?)$/);
    if (sectionMatch) {
      if (current) sections.push(current);
      current = { type: sectionMatch[1].trim(), note: '', lines: [] };
      continue;
    }
    // Lines starting with > are band/performance notes
    if (line.match(/^>\s*(.*)/)) {
      if (current) current.note = line.replace(/^>\s*/, '').trim();
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) sections.push(current);

  // Trim trailing empty lines from each section
  for (const s of sections) {
    while (s.lines.length && !s.lines[s.lines.length - 1].trim()) {
      s.lines.pop();
    }
  }

  return {
    title: meta.title || 'Untitled',
    artist: meta.artist || 'Unknown',
    key: meta.key || 'C',
    tempo: meta.tempo || 120,
    time: meta.time || '4/4',
    ccli: meta.ccli || '',
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
  if (song.structure?.length) {
    md += `structure: [${song.structure.join(', ')}]\n`;
  }
  md += '---\n\n';

  for (const sec of song.sections) {
    md += `## ${sec.type}\n`;
    if (sec.note) md += `> ${sec.note}\n`;
    md += sec.lines.join('\n') + '\n\n';
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

// Generate a unique ID for songs and setlists
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
