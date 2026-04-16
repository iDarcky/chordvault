import { describe, it, expect } from 'vitest';
import { isValidSong, isValidSetlist } from '../storage';

describe('isValidSong', () => {
  it('accepts a minimal valid song', () => {
    expect(isValidSong({ id: 'abc', md: '---\ntitle: T\n---\n' })).toBe(true);
  });

  it('rejects null / non-objects', () => {
    expect(isValidSong(null)).toBe(false);
    expect(isValidSong(undefined)).toBe(false);
    expect(isValidSong('string')).toBe(false);
    expect(isValidSong(42)).toBe(false);
  });

  it('rejects missing or non-string id', () => {
    expect(isValidSong({ md: 'x' })).toBe(false);
    expect(isValidSong({ id: '', md: 'x' })).toBe(false);
    expect(isValidSong({ id: 123, md: 'x' })).toBe(false);
  });

  it('rejects missing or non-string md', () => {
    expect(isValidSong({ id: 'a' })).toBe(false);
    expect(isValidSong({ id: 'a', md: null })).toBe(false);
    expect(isValidSong({ id: 'a', md: 42 })).toBe(false);
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
