import React, { useEffect, useRef } from 'react';
import { Card } from "@heroui/react";
import { SVGuitarChord } from 'svguitar';
import { CHORD_SHAPES } from '../data/chordShapes';

export default function ChordDiagram({ chord, size = 80 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const shape = CHORD_SHAPES[chord];
    if (!shape) return;

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
          color: '#888',
          emptyStringIndicatorSize: 0.5,
          strokeWidth: 1.5,
          nutWidth: 6,
          fretLabelFontSize: 20,
          fingerSize: 0.7,
          backgroundColor: 'transparent',
          fontFamily: 'var(--font-mono)',
        })
        .chord({
          fingers: shape.fingers,
          barres: shape.barres || [],
        })
        .draw();

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
            el.setAttribute('stroke', 'var(--divider)');
          }
          if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none' && el.tagName !== 'circle') {
            el.setAttribute('fill', 'var(--text-dim)');
          }
        });
        const titleEl = svg.querySelector('text');
        if (titleEl) titleEl.setAttribute('fill', 'var(--foreground)');

        svg.setAttribute('width', size);
        svg.setAttribute('height', size + 16);
      }
    } catch {
      // Silently fail
    }

    const container = containerRef.current;
    return () => {
      if (container) container.innerHTML = '';
    };
  }, [chord, size]);

  const shape = CHORD_SHAPES[chord];
  if (!shape) return null;

  return (
    <Card
      ref={containerRef}
      title={chord}
      shadow="none"
      className="bg-content2/40 border border-divider rounded-xl p-1 inline-flex flex-shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size + 16 }}
    />
  );
}
