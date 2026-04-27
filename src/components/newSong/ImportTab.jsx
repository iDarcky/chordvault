import { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { parseSongMd, generateId } from '../../parser';

const ACCEPT = '.md,.zip';

function isMd(file) {
  return file.name.toLowerCase().endsWith('.md');
}

function isZip(file) {
  return file.name.toLowerCase().endsWith('.zip');
}

function readText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function ImportTab({ onImportSongs, onImportSetlistFile, isMobile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (fileList) => {
    setError('');
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const zips = files.filter(isZip);
    const mds = files.filter(isMd);

    if (zips.length === 0 && mds.length === 0) {
      setError('Only .md song files and .zip setlist bundles are supported.');
      return;
    }

    if (zips.length > 0) {
      onImportSetlistFile(zips[0]);
      return;
    }

    try {
      const parsed = [];
      for (const f of mds) {
        const text = await readText(f);
        const song = { ...parseSongMd(text), id: generateId(), updatedAt: Date.now() };
        parsed.push(song);
      }
      if (parsed.length === 0) {
        setError('No valid .md files were found.');
        return;
      }
      onImportSongs(parsed);
    } catch {
      setError('Could not read one or more files. Make sure they are valid .md files.');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex-1 min-h-0 p-5 overflow-y-auto">
      {!isMobile ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors"
          style={{
            borderColor: dragOver ? 'var(--color-brand)' : 'var(--ds-gray-400)',
            background: dragOver ? 'var(--color-brand-soft)' : 'var(--ds-gray-100)',
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--ds-gray-200)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="text-heading-16 text-[var(--ds-gray-1000)] mb-1">
            Drop files here
          </div>
          <div className="text-copy-13 text-[var(--ds-gray-700)] mb-4">
            or click to browse — .md songs (multi-select) or .zip setlists
          </div>
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Choose files
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ background: 'var(--ds-gray-100)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--ds-gray-200)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="text-heading-16 text-[var(--ds-gray-1000)] mb-1">
            Import a file
          </div>
          <div className="text-copy-13 text-[var(--ds-gray-700)] mb-4">
            .md songs or .zip setlist bundles
          </div>
          <Button variant="brand" size="sm" onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-3 text-copy-13" style={{ color: 'var(--ds-red-1000)' }}>
          {error}
        </div>
      )}

      <ul className="mt-5 text-copy-12 text-[var(--ds-gray-600)] list-disc pl-5 space-y-1">
        <li><code>.md</code> — Setlists MD song format. Pick multiple to import in a row.</li>
        <li><code>.zip</code> — exported setlist bundle. Adds the setlist plus any new songs.</li>
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
