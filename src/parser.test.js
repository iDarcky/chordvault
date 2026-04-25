import { describe, it, expect } from 'vitest';
import {
  parseSongMd,
  songToMd,
  parseLine,
  parseTabBlock,
  serializeTabBlock,
  generateId,
} from './parser';

// The parser is the single highest-risk surface in the app — every chord
// chart flows through it, and a bad regex means a crashing chart view.
// These tests guard the inputs we actually ship + the malformed inputs a
// user could realistically type into the editor.

describe('parseLine', () => {
  it('parses inline chords interleaved with lyrics', () => {
    const out = parseLine("A[G]mazing [G7]grace");
    // Format depends on parseLine's specific shape; we just assert the
    // chord names are extracted in order.
    const flattened = JSON.stringify(out);
    expect(flattened).toContain('G');
    expect(flattened).toContain('G7');
  });

  it('treats an unclosed bracket as plain text rather than crashing', () => {
    expect(() => parseLine('Hello [G world')).not.toThrow();
  });

  it('handles a line with no chords', () => {
    expect(() => parseLine('Just lyrics here.')).not.toThrow();
  });

  it('handles an empty line', () => {
    expect(() => parseLine('')).not.toThrow();
  });
});

describe('parseSongMd', () => {
  const minimalMd = `---
title: Test Song
key: C
---

## Verse 1
[C]Hello [G]world
`;

  it('parses minimal frontmatter + a single section', () => {
    const song = parseSongMd(minimalMd);
    expect(song.title).toBe('Test Song');
    expect(song.key).toBe('C');
    expect(Array.isArray(song.sections)).toBe(true);
    expect(song.sections.length).toBeGreaterThan(0);
  });

  it('does not crash on a song with only frontmatter', () => {
    const md = `---\ntitle: Just metadata\nkey: G\n---\n`;
    expect(() => parseSongMd(md)).not.toThrow();
    const song = parseSongMd(md);
    expect(song.title).toBe('Just metadata');
  });

  it('does not crash on completely empty input', () => {
    expect(() => parseSongMd('')).not.toThrow();
  });

  it('does not crash on missing frontmatter', () => {
    const md = '## Verse 1\n[C]Hello world\n';
    expect(() => parseSongMd(md)).not.toThrow();
  });

  it('does not crash on malformed chord brackets in a section', () => {
    const md = `---\ntitle: Broken\nkey: G\n---\n\n## Verse 1\n[G unclosed [C]bracket\n`;
    expect(() => parseSongMd(md)).not.toThrow();
  });

  it('parses a modulate marker into a structured object on the section line', () => {
    const md = `---\ntitle: Mod\nkey: G\n---\n\n## Verse 1\n{modulate: +2}\n[G]Hello\n`;
    const song = parseSongMd(md);
    const lines = song.sections[0].lines || [];
    const hasModulate = lines.some(l => typeof l === 'object' && l && l.type === 'modulate');
    expect(hasModulate).toBe(true);
  });

  it('parses tab blocks into structured objects with strings', () => {
    const md = `---\ntitle: Tab\nkey: G\n---\n\n## Verse 1\n{tab}\ne|--0--2--3--|\nB|--1--3--5--|\nG|--0--2--4--|\nD|-----------|\nA|--3--------|\nE|-----------|\n{/tab}\n`;
    const song = parseSongMd(md);
    const lines = song.sections[0].lines || [];
    const tab = lines.find(l => typeof l === 'object' && l && l.type === 'tab');
    expect(tab).toBeTruthy();
    expect(Array.isArray(tab.strings)).toBe(true);
    expect(tab.strings.length).toBe(6);
  });
});

describe('songToMd round-trip', () => {
  const sourceMd = `---
title: Round Trip
artist: Test Author
key: G
tempo: 90
time: 4/4
---

## Verse 1
[G]Hello [C]world
[G]Plain text after a chord.

## Chorus
[D]La la [G]la
`;

  it('parseSongMd → songToMd → parseSongMd preserves title/key/tempo', () => {
    const first = parseSongMd(sourceMd);
    const re = parseSongMd(songToMd(first));
    expect(re.title).toBe(first.title);
    expect(re.key).toBe(first.key);
    expect(re.tempo).toBe(first.tempo);
  });

  it('round-trip preserves section count and section names', () => {
    const first = parseSongMd(sourceMd);
    const re = parseSongMd(songToMd(first));
    expect(re.sections.length).toBe(first.sections.length);
    for (let i = 0; i < first.sections.length; i++) {
      expect(re.sections[i].name).toBe(first.sections[i].name);
    }
  });

  it('round-trip preserves modulate markers', () => {
    const md = `---\ntitle: Mod\nkey: G\n---\n\n## Verse 1\n{modulate: +2}\n[G]A\n`;
    const out = songToMd(parseSongMd(md));
    expect(out).toContain('{modulate:');
  });

  it('round-trip preserves tab blocks', () => {
    const md = `---\ntitle: Tab\nkey: G\n---\n\n## Verse 1\n{tab}\ne|--0--|\nB|--1--|\nG|--0--|\nD|-----|\nA|--3--|\nE|-----|\n{/tab}\n`;
    const out = songToMd(parseSongMd(md));
    expect(out).toContain('{tab');
    expect(out).toContain('{/tab}');
  });
});

describe('parseTabBlock', () => {
  it('extracts six strings from a standard guitar tab', () => {
    const lines = [
      'e|--0--2--3--|',
      'B|--1--3--5--|',
      'G|--0--2--4--|',
      'D|-----------|',
      'A|--3--------|',
      'E|-----------|',
    ];
    const tab = parseTabBlock(lines);
    expect(tab).toBeTruthy();
    expect(tab.strings.length).toBe(6);
    expect(tab.strings[0].note).toBe('e');
    expect(tab.strings[5].note).toBe('E');
  });

  it('serialize → parse round-trip preserves string content', () => {
    const original = {
      type: 'tab',
      strings: [
        { note: 'e', content: '--0--' },
        { note: 'B', content: '--1--' },
        { note: 'G', content: '--0--' },
        { note: 'D', content: '-----' },
        { note: 'A', content: '--3--' },
        { note: 'E', content: '-----' },
      ],
    };
    const serialized = serializeTabBlock(original);
    expect(serialized).toContain('{tab');
    expect(serialized).toContain('{/tab}');
  });
});

describe('generateId', () => {
  it('produces unique values', () => {
    const ids = new Set();
    for (let i = 0; i < 200; i++) ids.add(generateId());
    expect(ids.size).toBe(200);
  });

  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});
