import React, { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Card,
  CardContent,
  ButtonGroup,
  Chip,
  Select,
  Separator,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ListBox,
  ListBoxItem
} from "@heroui/react";
import { transposeKey, ALL_KEYS, semitonesBetween } from '../music';
import { generateId } from '../parser';

export default function SetlistBuilder({ songs, setlist, onSave, onBack, onDelete }) {
  const [name, setName] = useState(setlist?.name || '');
  const [date, setDate] = useState(setlist?.date || new Date().toISOString().slice(0, 10));
  const [service, setService] = useState(setlist?.service || 'Morning');
  const [items, setItems] = useState(setlist?.items || []);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    const q = search.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const addSong = (song) => {
    setItems([...items, {
      type: 'song',
      songId: song.id,
      transpose: 0,
      capo: 0,
      note: '',
    }]);
    setIsAddingOpen(false);
    setSearch('');
  };

  const addBreak = () => {
    setItems([...items, {
      type: 'break',
      label: 'Prayer',
      duration: 5,
      note: '',
    }]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx, dir) => {
    const newItems = [...items];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    setItems(newItems);
  };

  const updateTranspose = (idx, t) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], transpose: t };
    setItems(newItems);
  };

  const updateCapo = (idx, c) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], capo: c };
    setItems(newItems);
  };

  const updateNote = (idx, n) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], note: n };
    setItems(newItems);
  };

  const updateBreakField = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setItems(newItems);
  };

  const handleSave = () => {
    onSave({
      id: setlist?.id || generateId(),
      name, date, service, items,
    });
  };

  const getSong = (id) => songs.find(s => s.id === id);

  const songCount = items.filter(it => it.type === 'song').length;
  const breakCount = items.length - songCount;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" size="sm" onPress={onBack}>
            <span className="text-xl">←</span>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">{setlist ? 'Edit Setlist' : 'New Setlist'}</h1>
        </div>
        <div className="flex gap-2">
          {setlist && (
            <Button color="danger" variant="flat" size="sm" className="font-bold" onPress={() => { if (confirm('Delete this setlist?')) onDelete(setlist.id); }}>
              Delete
            </Button>
          )}
          <Button color="primary" size="sm" className="font-bold" onPress={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        <Card className="bg-content1 border-none shadow-sm">
          <CardContent className="p-4 space-y-4">
            <Input
              label="Setlist Name"
              placeholder="e.g. Sunday Morning Service"
              variant="flat"
              value={name}
              onValueChange={setName}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                variant="flat"
                value={date}
                onValueChange={setDate}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-1">Service</span>
                <ButtonGroup size="sm" variant="flat" fullWidth>
                  {['Morning', 'Evening', 'Special'].map(s => (
                    <Button
                      key={s}
                      onPress={() => setService(s)}
                      className={service === s ? "bg-primary text-primary-foreground font-bold" : ""}
                    >
                      {s}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-default-400 uppercase tracking-widest">
              Items ({items.length})
            </h2>
            <div className="flex gap-2 text-[10px] font-bold text-default-300 uppercase">
              <span>{songCount} songs</span>
              <span>&middot;</span>
              <span>{breakCount} breaks</span>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const isBreak = item.type === 'break';
              const song = !isBreak ? getSong(item.songId) : null;

              if (!isBreak && !song) return null;

              return (
                <Card key={idx} className="bg-content1 border-none overflow-hidden shadow-sm">
                  <CardContent className="p-0 flex flex-row items-stretch">
                    <div className="w-10 bg-default-50 flex flex-col items-center justify-center border-r border-divider py-1">
                      <Button isIconOnly size="sm" variant="light" className="h-6 w-8 min-w-0" isDisabled={idx === 0} onPress={() => moveItem(idx, -1)}>
                        <span className="text-xs text-default-400">▲</span>
                      </Button>
                      <span className="font-mono text-xs font-bold text-default-300">{idx + 1}</span>
                      <Button isIconOnly size="sm" variant="light" className="h-6 w-8 min-w-0" isDisabled={idx === items.length - 1} onPress={() => moveItem(idx, 1)}>
                        <span className="text-xs text-default-400">▼</span>
                      </Button>
                    </div>

                    <div className="flex-1 p-3 flex flex-col gap-2 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {isBreak ? (
                          <Input
                            size="sm"
                            variant="flat"
                            placeholder="Break label (e.g. Prayer)"
                            value={item.label}
                            onValueChange={(v) => updateBreakField(idx, 'label', v)}
                            className="max-w-[200px]"
                          />
                        ) : (
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold truncate">{song.title}</h3>
                            <p className="text-[10px] text-default-400 truncate uppercase font-semibold">{song.artist}</p>
                          </div>
                        )}
                        <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => removeItem(idx)}>
                          <span className="text-lg">×</span>
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {!isBreak && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-default-300 uppercase">Key</span>
                              <Select
                                size="sm"
                                variant="flat"
                                selectedKeys={[transposeKey(song.key, item.transpose)]}
                                onSelectionChange={(keys) => updateTranspose(idx, semitonesBetween(song.key, Array.from(keys)[0]))}
                                className="w-20"
                                disallowEmptySelection
                                classNames={{ trigger: "h-7 min-h-unit-7 bg-default-100", value: "text-xs font-mono font-bold text-warning" }}
                              >
                                {ALL_KEYS.map(k => <ListBoxItem key={k} value={k}>{k}</ListBoxItem>)}
                              </Select>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-default-300 uppercase">Capo</span>
                              <Select
                                size="sm"
                                variant="flat"
                                selectedKeys={[String(item.capo || 0)]}
                                onSelectionChange={(keys) => updateCapo(idx, parseInt(Array.from(keys)[0]))}
                                className="w-16"
                                disallowEmptySelection
                                classNames={{ trigger: "h-7 min-h-unit-7 bg-default-100", value: "text-xs font-mono font-bold" }}
                              >
                                {[0,1,2,3,4,5,6,7,8,9].map(n => <ListBoxItem key={String(n)} value={String(n)}>{String(n)}</ListBoxItem>)}
                              </Select>
                            </div>
                          </>
                        )}
                        {isBreak && (
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-default-300 uppercase">Min</span>
                            <Input
                              type="number"
                              size="sm"
                              variant="flat"
                              className="w-16"
                              classNames={{ input: "text-xs font-mono text-center", inputWrapper: "h-7 min-h-unit-7" }}
                              value={String(item.duration || 0)}
                              onValueChange={(v) => updateBreakField(idx, 'duration', parseInt(v) || 0)}
                            />
                          </div>
                        )}
                        <Input
                          size="sm"
                          variant="flat"
                          placeholder="Performance note..."
                          className="flex-1 min-w-[120px]"
                          classNames={{ input: "text-xs italic", inputWrapper: "h-7 min-h-unit-7" }}
                          value={item.note}
                          onValueChange={(v) => isBreak ? updateBreakField(idx, 'note', v) : updateNote(idx, v)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="flat"
              className="border-2 border-dashed border-divider h-14 font-bold text-default-500"
              onPress={() => setIsAddingOpen(true)}
            >
              + Add Song
            </Button>
            <Button
              variant="flat"
              className="border-2 border-dashed border-divider h-14 font-bold text-default-500"
              onPress={addBreak}
            >
              + Add Break
            </Button>
          </div>
        </section>
      </div>

      <Modal
        isOpen={isAddingOpen}
        onOpenChange={setIsAddingOpen}
        scrollBehavior="inside"
        placement="center"
        size="lg"
      >
        <ModalDialog>
          {(onClose) => (
            <>
              <ModalHeader className="px-4 py-4 border-b border-divider flex flex-col gap-1">
                <span className="text-lg font-bold">Add Song to Setlist</span>
                <Input
                  autoFocus
                  placeholder="Search songs..."
                  variant="flat"
                  isClearable
                  value={search}
                  onValueChange={setSearch}
                  size="sm"
                />
              </ModalHeader>
              <ModalBody className="p-0">
                <ListBox
                  aria-label="Available songs"
                  onAction={(key) => addSong(songs.find(s => s.id === key))}
                  variant="flat"
                >
                  {available.map(song => (
                    <ListBoxItem
                      key={song.id}
                      className="px-4 py-3 border-b border-divider last:border-none"
                      textValue={song.title}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center font-bold text-warning font-mono text-xs">{song.key}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{song.title}</div>
                          <div className="text-xs text-default-400 truncate">{song.artist}</div>
                        </div>
                      </div>
                    </ListBoxItem>
                  ))}
                </ListBox>
                {available.length === 0 && (
                  <div className="text-center py-12 text-default-400 text-sm">No songs found</div>
                )}
              </ModalBody>
            </>
          )}
        </ModalDialog>
      </Modal>
    </div>
  );
}
