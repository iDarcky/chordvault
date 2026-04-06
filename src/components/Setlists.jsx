import React, { useMemo, useRef } from 'react';
import {
  Button,
  Card,
  CardContent,
  ListBox,
  ListBoxItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { transposeKey } from '../music';
import PageHeader from './PageHeader';

export default function Setlists({
  songs, setlists,
  onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist,
}) {
  const fileRef = useRef(null);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setlists
      .filter(sl => sl.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [setlists]);

  const all = useMemo(() => {
    return [...setlists].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [setlists]);

  const formatDate = (date) =>
    new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

  const renderSetlistSection = (label, items) => (
    <div className="mb-8 text-foreground">
      <h2 className="text-sm font-bold text-default-400 uppercase tracking-widest mb-3 px-1">
        {label}
      </h2>
      <Card className="bg-content1 border-none shadow-sm">
        <CardContent className="p-0">
          <ListBox
            aria-label={`Section ${label}`}
            items={items}
            onAction={(key) => onViewSetlist(items.find(sl => sl.id === key))}
          >
            {(sl) => (
              <ListBoxItem
                key={sl.id}
                className="px-4 py-4 border-b border-divider last:border-none"
                textValue={sl.name || 'Untitled Setlist'}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold truncate">{sl.name || 'Untitled Setlist'}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-default-400">
                      <span>{formatDate(sl.date)}</span>
                      {sl.service && <span>&middot; {sl.service}</span>}
                      <span>&middot; {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    {sl.items?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sl.items.slice(0, 5).map((it, idx) => {
                          if (it.type === 'break') {
                            return (
                              <Chip key={idx} size="xs" variant="flat" className="h-4 px-1 text-[9px] italic opacity-60">
                                {it.label || 'Break'}
                              </Chip>
                            );
                          }
                          const song = songs.find(s => s.id === it.songId);
                          if (!song) return null;
                          return (
                            <Chip key={idx} size="xs" variant="flat" color="default" className="h-4 px-1 text-[9px]">
                              <span className="font-mono font-bold text-warning mr-1">
                                {transposeKey(song.key, it.transpose)}
                              </span>
                              {song.title}
                            </Chip>
                          );
                        })}
                        {sl.items.length > 5 && (
                          <span className="text-[9px] text-default-300">+${sl.items.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                    Live
                  </div>
                </div>
              </ListBoxItem>
            )}
          </ListBox>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <PageHeader title="Setlists" />

      <div className="px-6">
        {setlists.length === 0 && (
          <div className="text-center py-12 text-default-400 border-2 border-dashed border-divider rounded-xl">
            No setlists yet. Tap + to create one.
          </div>
        )}

        {upcoming.length > 0 && renderSetlistSection('Upcoming', upcoming)}
        {all.length > 0 && renderSetlistSection('All Setlists', all)}
      </div>

      <div className="fixed bottom-24 right-6 z-50">
        <Dropdown>
          <DropdownTrigger
            radius="full"
            className="w-14 h-14 bg-primary text-primary-foreground shadow-lg shadow-primary/40 min-w-0 p-0 flex items-center justify-center"
          >
            <span className="text-3xl font-light">+</span>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu aria-label="Action Menu" onAction={(key) => {
              if (key === 'new-setlist') onNewSetlist();
              if (key === 'import-zip') fileRef.current?.click();
            }}>
              <DropdownItem key="new-setlist">New Setlist</DropdownItem>
              <DropdownItem key="import-zip">Import .zip</DropdownItem>
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>

      <input ref={fileRef} type="file" accept=".zip"
        onChange={e => {
          if (e.target.files[0]) onImportSetlist(e.target.files[0]);
          e.target.value = '';
        }}
        className="hidden" />
    </div>
  );
}
