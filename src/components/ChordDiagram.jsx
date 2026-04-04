import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { CHORD_SHAPES } from '../data/chordShapes';

export default function ChordDiagram({ chord, size = 80 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const shape = CHORD_SHAPES[chord];
    if (!shape) return;

    container.innerHTML = '';

    try {
      const chart = new SVGuitarChord(container);

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

      const svg = container.querySelector('svg');
      if (svg) {
        svg.querySelectorAll('circle[fill]').forEach(el => {
          if (el.getAttribute('fill') !== 'none') {
            el.setAttribute('fill', 'var(--geist-link)');
          }
        });
        svg.querySelectorAll('text').forEach(el => {
          el.setAttribute('fill', 'var(--accents-4)');
        });
        svg.querySelectorAll('line, path, rect').forEach(el => {
          if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke', 'var(--accents-2)');
          }
        });
        const titleEl = svg.querySelector('text');
        if (titleEl) {
          titleEl.setAttribute('fill', 'var(--foreground)');
          titleEl.style.fontWeight = '900';
        }
        svg.setAttribute('width', size);
        svg.setAttribute('height', size + 16);
      }
    } catch (err) {
      console.error('Failed to draw chord diagram', err);
    }

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
      className="inline-flex shrink-0 items-center justify-center bg-background border border-accents-2 rounded-geist p-1 shadow-sm transition-transform hover:scale-105"
      style={{ width: size, height: size + 16 }}
    />
  );
}
