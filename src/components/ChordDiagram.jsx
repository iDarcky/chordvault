import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { CHORD_SHAPES } from '../data/chordShapes';

export default function ChordDiagram({ chord, size = 80 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const shape = CHORD_SHAPES[chord];
    if (!shape) return;

    // Clear previous render
    containerRef.current.innerHTML = '';

    try {
      const chart = new SVGuitarChord(containerRef.current);

      chart
        .configure({
          strings: 6,
          frets: 4,
          position: shape.position || 1,
          title: chord,
          titleFontSize: 28,
          titleBottomMargin: 8,
          color: '#666',
          emptyStringIndicatorSize: 0.5,
          strokeWidth: 1,
          nutWidth: 4,
          fretLabelFontSize: 20,
          fingerSize: 0.6,
          backgroundColor: 'transparent',
          fontFamily: 'var(--fm, monospace)',
        })
        .chord({
          fingers: shape.fingers,
          barres: shape.barres || [],
        })
        .draw();

      // Post-process SVG to inject CSS variable colors
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.querySelectorAll('circle[fill]').forEach(el => {
          if (el.getAttribute('fill') !== 'none') {
            el.setAttribute('fill', 'var(--accent)');
          }
        });
        svg.querySelectorAll('text').forEach(el => {
          el.setAttribute('fill', 'var(--text-muted)');
        });
        svg.querySelectorAll('line, path, rect').forEach(el => {
          if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke', 'var(--border)');
          }
          if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none' && el.tagName !== 'circle') {
            el.setAttribute('fill', 'var(--text-dim)');
          }
        });
        // Title text brighter
        const titleEl = svg.querySelector('text');
        if (titleEl) titleEl.setAttribute('fill', 'var(--text-bright)');
        // Set SVG dimensions
        svg.setAttribute('width', size);
        svg.setAttribute('height', size + 16);
      }
    } catch {
      // Silently fail for unsupported chords
    }

    const container = containerRef.current;
    return () => {
      if (container) container.innerHTML = '';
    };
  }, [chord, size]);

  const shape = CHORD_SHAPES[chord];
  if (!shape) return null;

  return (
    <div
      ref={containerRef}
      title={chord}
      style={{
        width: size, height: size + 16,
        display: 'inline-flex', flexShrink: 0,
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 2,
      }}
    />
  );
}
