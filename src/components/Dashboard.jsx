import React, { useState, useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  Chip
} from "@heroui/react";
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';

export default function Dashboard({
  songs, setlists,
  onSelectSong, onNewSong,
  onNewSetlist, onViewSetlist, onPlaySetlist,
  onGoLibrary, onGoSetlists,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const recentSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      .slice(0, 5);
  }, [songs]);

  const upcomingSetlists = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setlists
      .filter(sl => sl.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [setlists]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { songs: [], setlists: [] };
    const q = searchQuery.toLowerCase();
    return {
      songs: songs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      ).slice(0, 10),
      setlists: setlists.filter(sl =>
        (sl.name || '').toLowerCase().includes(q) ||
        (sl.service || '').toLowerCase().includes(q)
      ).slice(0, 5),
    };
  }, [songs, setlists, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <PageHeader title="Setlists MD">
        <Button
          onPress={() => setIsSearchOpen(true)}
          variant="flat"
          className="bg-default-100 text-default-500 font-medium rounded-full h-8 px-3"
          aria-label="Open Search"
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <SearchIcon size={18} />
            <span>Search</span>
          </div>
        </Button>
      </PageHeader>

      <div className="px-6 space-y-8 mt-4">
        {upcomingSetlists.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3 px-1">
              Upcoming
            </h2>
            <Card className="bg-content1 border-none shadow-sm">
              <CardContent className="p-2 space-y-1">
                {upcomingSetlists.map((sl) => (
                  <div
                    key={sl.id}
                    onClick={() => onViewSetlist(sl)}
                    className="px-4 py-3 border-b border-divider last:border-none cursor-pointer hover:bg-default-50 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold truncate">{sl.name || 'Untitled'}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-default-400">
                        <span>{new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        {sl.service && <span>&middot; {sl.service}</span>}
                        <span>&middot; {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                      Live
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {recentSongs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3 px-1">
              Recent
            </h2>
            <Card className="bg-content1 border-none shadow-sm">
              <CardContent className="p-2 space-y-1">
                {recentSongs.map((song) => (
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
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onPress={onGoLibrary}
            className="h-16 text-md font-semibold bg-content2"
            radius="xl"
          >
            Library
          </Button>
          <Button
            onPress={onGoSetlists}
            className="h-16 text-md font-semibold bg-content2"
            radius="xl"
          >
            Setlists
          </Button>
        </div>
      </div>

      <div className="fixed bottom-24 right-6 z-50">
        <Dropdown>
          <DropdownTrigger
            radius="full"
            className="w-14 h-14 bg-primary text-primary-foreground shadow-lg shadow-primary/40 min-w-0 p-0 flex items-center justify-center"
            aria-label="Add New"
          >
            <span className="text-3xl font-light pointer-events-none">+</span>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu aria-label="Action Menu" onAction={(key) => {
              if (key === 'new-song') onNewSong();
              if (key === 'new-setlist') onNewSetlist();
            }}>
              <DropdownItem key="new-song">New Song</DropdownItem>
              <DropdownItem key="new-setlist">New Setlist</DropdownItem>
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>

      <Modal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <ModalBackdrop />
        <ModalContainer size="full" className="m-0 p-0">
          <ModalDialog className="rounded-none h-screen max-h-screen bg-background border-none shadow-none">
            {({ onClose }) => (
              <>
                <ModalHeader className="flex gap-3 px-4 py-4 border-b border-divider items-center">
                  <Button isIconOnly variant="light" onPress={onClose} aria-label="Close search">
                    <span className="text-xl text-foreground">←</span>
                  </Button>
                  <Input
                    autoFocus
                    placeholder="Search songs, setlists..."
                    variant="flat"
                    isClearable
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="flex-1"
                    size="lg"
                    aria-label="Search query"
                  />
                </ModalHeader>
                <ModalBody className="px-4 py-2 overflow-auto">
                  {!searchQuery.trim() && (
                    <div className="text-center py-12 text-default-400 text-sm">
                      Search across all songs and setlists
                    </div>
                  )}

                  {searchQuery.trim() && searchResults.songs.length === 0 && searchResults.setlists.length === 0 && (
                    <div className="text-center py-12 text-default-400 text-sm">
                      No results found
                    </div>
                  )}

                  {searchResults.songs.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-3 px-2">Songs</p>
                      <div className="space-y-1">
                        {searchResults.songs.map((song) => (
                          <div
                            key={song.id}
                            onClick={() => { onClose(); onSelectSong(song); }}
                            className="py-3 px-2 hover:bg-default-50 rounded-lg cursor-pointer flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center font-bold text-warning font-mono">
                              {song.key}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate">{song.title}</div>
                              <div className="text-xs text-default-400 truncate">{song.artist}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.setlists.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-3 px-2">Setlists</p>
                      <div className="space-y-1">
                        {searchResults.setlists.map((sl) => (
                          <div
                            key={sl.id}
                            onClick={() => { onClose(); onViewSetlist(sl); }}
                            className="py-3 px-2 hover:bg-default-50 rounded-lg cursor-pointer"
                          >
                            <div className="font-bold truncate">{sl.name || 'Untitled'}</div>
                            <div className="text-xs text-default-400 truncate">
                              {`${new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})} ${sl.service ? ' \u00B7 ' + sl.service : ''} \u00B7 ${sl.items?.length || 0} song${(sl.items?.length || 0) !== 1 ? 's' : ''}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ModalBody>
              </>
            )}
          </ModalDialog>
        </ModalContainer>
      </Modal>
    </div>
  );
}
