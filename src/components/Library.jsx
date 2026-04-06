import React, { useState, useMemo, useRef } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  Input
} from "@heroui/react";
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';

export default function Library({
  songs, onSelectSong, onNewSong, onImportSong,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const [tagFilter, setTagFilter] = useState(new Set());
  const fileRef = useRef(null);

  const allTags = useMemo(() => {
    const tags = new Set();
    songs.forEach(s => (s.tags || []).forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [songs]);

  const filtered = useMemo(() => {
    let list = songs;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    }
    if (tagFilter.size > 0) {
      list = list.filter(s =>
        Array.from(tagFilter).some(t => (s.tags || []).includes(t))
      );
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (sort === 'key') sorted.sort((a, b) => a.key.localeCompare(b.key));
    return sorted;
  }, [songs, query, sort, tagFilter]);

  const grouped = useMemo(() => {
    const groups = [];
    let currentLabel = null;
    for (const song of filtered) {
      let label;
      if (sort === 'title') {
        label = (song.title[0] || '#').toUpperCase();
      } else if (sort === 'artist') {
        label = song.artist || 'Unknown';
      } else {
        label = song.key || '?';
      }
      if (label !== currentLabel) {
        groups.push({ label, songs: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].songs.push(song);
    }
    return groups;
  }, [filtered, sort]);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background pb-32 text-foreground">
      <PageHeader title="Library" />

      <div className="px-6 space-y-4 mb-6 mt-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search songs..."
            startContent={<SearchIcon size={18} className="text-default-400" />}
            variant="flat"
            size="md"
            className="flex-1"
          />
          {allTags.length > 0 && (
            <Dropdown>
              <DropdownTrigger
                variant="flat"
                size="md"
                color={tagFilter.size > 0 ? "primary" : "default"}
                className="font-medium px-4"
              >
                Tags {tagFilter.size > 0 ? `(${tagFilter.size})` : ""}
              </DropdownTrigger>
              <DropdownPopover>
                <DropdownMenu
                  aria-label="Filter by tags"
                  closeOnSelect={false}
                  selectedKeys={tagFilter}
                  selectionMode="multiple"
                  onSelectionChange={setTagFilter}
                >
                  {allTags.map(tag => (
                    <DropdownItem key={tag}>{tag}</DropdownItem>
                  ))}
                </DropdownMenu>
              </DropdownPopover>
            </Dropdown>
          )}
        </div>

        <div className="flex bg-default-100 p-1 rounded-xl w-full">
          {['title', 'artist', 'key'].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={sort === s ? "solid" : "light"}
              color={sort === s ? "primary" : "default"}
              className={`flex-1 h-8 text-xs font-bold ${sort === s ? 'shadow-sm' : 'text-default-500'}`}
              onPress={() => setSort(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-default-400 border-2 border-dashed border-divider rounded-xl">
            {songs.length === 0
              ? 'No songs yet. Tap + to create or import.'
              : 'No songs match your search.'}
          </div>
        )}

        {grouped.map(group => (
          <div key={group.label}>
            <h2 className="text-sm font-bold text-default-400 uppercase tracking-widest mb-3 px-1">
              {group.label}
            </h2>
            <Card className="bg-content1 border-none shadow-sm">
              <CardContent className="p-2 space-y-1">
                {group.songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onSelectSong(song)}
                    className="px-4 py-3 border-b border-divider last:border-none cursor-pointer hover:bg-default-50 rounded-lg flex flex-col"
                  >
                    <div className="text-base font-semibold truncate">{song.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-default-400">
                      <span>{song.artist}</span>
                      <Chip size="sm" variant="dot" color="warning" classNames={{ content: "font-mono font-bold text-warning" }}>
                        {song.key}
                      </Chip>
                      {song.tempo && <span className="text-xs opacity-70 font-mono">{song.tempo} bpm</span>}
                      {(song.tags || []).map(t => (
                        <Chip key={t} size="xs" variant="flat" color="primary" className="h-4 px-1 text-[9px] uppercase font-bold">
                          {t}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 right-6 z-50">
        <Dropdown>
          <DropdownTrigger
            radius="full"
            className="w-14 h-14 bg-primary text-primary-foreground shadow-lg shadow-primary/40 min-w-0 p-0 flex items-center justify-center"
          >
            <span className="text-3xl font-light pointer-events-none">+</span>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu aria-label="Action Menu" onAction={(key) => {
              if (key === 'new-song') onNewSong();
              if (key === 'import-md') fileRef.current?.click();
            }}>
              <DropdownItem key="new-song">New Song</DropdownItem>
              <DropdownItem key="import-md">Import .md</DropdownItem>
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>

      <input ref={fileRef} type="file" accept=".md,.txt" multiple
        onChange={handleFiles} className="hidden" />
    </div>
  );
}
