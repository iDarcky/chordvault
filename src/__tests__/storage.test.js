import { describe, it, expect } from 'vitest';
import { isValidSong, isValidSetlist } from '../storage';

describe('isValidSong', () => {
  it('accepts a minimal valid song (parsed shape)', () => {
    expect(isValidSong({ id: 'abc', title: 'T', artist: 'A', sections: [] })).toBe(true);
  });

  it('rejects null / non-objects', () => {
    expect(isValidSong(null)).toBe(false);
    expect(isValidSong(undefined)).toBe(false);
    expect(isValidSong('string')).toBe(false);
    expect(isValidSong(42)).toBe(false);
  });

  it('rejects missing or non-string id', () => {
    expect(isValidSong({ title: 'T', sections: [] })).toBe(false);
    expect(isValidSong({ id: '', title: 'T', sections: [] })).toBe(false);
    expect(isValidSong({ id: 123, title: 'T', sections: [] })).toBe(false);
  });

  it('rejects missing title or sections', () => {
    expect(isValidSong({ id: 'a' })).toBe(false);
    expect(isValidSong({ id: 'a', title: 'T' })).toBe(false);
    expect(isValidSong({ id: 'a', sections: [] })).toBe(false);
    expect(isValidSong({ id: 'a', title: 'T', sections: 'nope' })).toBe(false);
  });
});

describe('isValidSetlist', () => {
  it('accepts a minimal valid setlist', () => {
    expect(isValidSetlist({ id: 'abc', name: 'Sunday', items: [] })).toBe(true);
  });

  it('rejects null / non-objects', () => {
    expect(isValidSetlist(null)).toBe(false);
    expect(isValidSetlist('string')).toBe(false);
  });

  it('rejects missing required fields', () => {
    expect(isValidSetlist({ id: 'a', items: [] })).toBe(false);
    expect(isValidSetlist({ id: 'a', name: 'x' })).toBe(false);
    expect(isValidSetlist({ name: 'x', items: [] })).toBe(false);
  });

  it('requires items to be an array', () => {
    expect(isValidSetlist({ id: 'a', name: 'x', items: {} })).toBe(false);
    expect(isValidSetlist({ id: 'a', name: 'x', items: null })).toBe(false);
  });
});
