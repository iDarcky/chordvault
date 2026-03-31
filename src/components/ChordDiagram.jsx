import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { CHORD_SHAPES } from '../data/chordShapes';

export default function ChordDiagram({ chord, size = 120 }) {
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
          titleFontSize: 30,
          titleBottomMargin: 10,
          color: 'var(--text)',
          emptyStringIndicatorSize: 0.6,
          strokeWidth: 1.5,
          nutWidth: 5,
          fretLabelFontSize: 22,
          // Colors using CSS vars (passed as strings — svguitar accepts them)
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
            el.setAttribute('fill', 'var(--chord)');
          }
        });
        svg.querySelectorAll('text').forEach(el => {
          el.setAttribute('fill', 'var(--text)');
        });
        svg.querySelectorAll('line, path, rect').forEach(el => {
          if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke', 'var(--text-muted)');
          }
          if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none' && el.tagName !== 'circle') {
            el.setAttribute('fill', 'var(--text-muted)');
          }
        });
        // Title text brighter
        const titleEl = svg.querySelector('text');
        if (titleEl) titleEl.setAttribute('fill', 'var(--text-bright)');
        // Set SVG dimensions
        svg.setAttribute('width', size);
        svg.setAttribute('height', size + 20);
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
        width: size, height: size + 20,
        display: 'inline-block', flexShrink: 0,
      }}
    />
  );
}
