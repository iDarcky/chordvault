import { useMemo } from 'react';

const STRING_SPACING = 18;
const LABEL_WIDTH = 28;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 8;
const CHAR_WIDTH = 9;

export default function TabBlock({ data }) {
  const parsed = useMemo(() => parseForRender(data), [data]);

  if (!parsed.strings.length) return null;

  const height = PADDING_TOP + (parsed.strings.length - 1) * STRING_SPACING + PADDING_BOTTOM;
  const contentWidth = parsed.maxLen * CHAR_WIDTH;
  const totalWidth = LABEL_WIDTH + contentWidth + 16;

  return (
    <div className="bg-accents-1/30 rounded-geist border border-accents-2 p-2 my-4 overflow-x-auto hide-scrollbar">
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="block"
      >
        {/* String lines */}
        {parsed.strings.map((str, i) => {
          const y = PADDING_TOP + i * STRING_SPACING;
          return (
            <line
              key={`line-${i}`}
              x1={LABEL_WIDTH}
              y1={y}
              x2={LABEL_WIDTH + contentWidth}
              y2={y}
              stroke="var(--accents-2)"
              strokeWidth={1}
            />
          );
        })}

        {/* String labels */}
        {parsed.strings.map((str, i) => {
          const y = PADDING_TOP + i * STRING_SPACING;
          return (
            <text
              key={`label-${i}`}
              x={LABEL_WIDTH - 8}
              y={y + 4}
              fill="var(--accents-4)"
              className="font-mono text-[11px] font-bold"
              textAnchor="end"
            >
              {str.note}
            </text>
          );
        })}

        {/* Bar lines */}
        {parsed.barPositions.map((pos, i) => (
          <line
            key={`bar-${i}`}
            x1={LABEL_WIDTH + pos * CHAR_WIDTH}
            y1={PADDING_TOP - 4}
            x2={LABEL_WIDTH + pos * CHAR_WIDTH}
            y2={PADDING_TOP + (parsed.strings.length - 1) * STRING_SPACING + 4}
            stroke="var(--accents-3)"
            strokeWidth={1.5}
          />
        ))}

        {/* Fret numbers and techniques */}
        {parsed.strings.map((str, si) => {
          const y = PADDING_TOP + si * STRING_SPACING;
          return str.frets.map((f, fi) => (
            <g key={`fret-${si}-${fi}`}>
              <rect
                x={LABEL_WIDTH + f.pos * CHAR_WIDTH - (f.fret >= 10 ? 7 : 4)}
                y={y - 7}
                width={f.fret >= 10 ? 14 : 9}
                height={14}
                fill="var(--background)"
                rx={2}
              />
              <text
                x={LABEL_WIDTH + f.pos * CHAR_WIDTH}
                y={y + 4}
                fill="var(--geist-link)"
                className="font-mono text-[12px] font-black"
                textAnchor="middle"
              >
                {f.fret}
              </text>
              {f.technique && (
                <text
                  x={LABEL_WIDTH + (f.pos + 1) * CHAR_WIDTH}
                  y={y - 6}
                  fill="var(--accents-5)"
                  className="font-mono text-[9px] font-bold"
                >
                  {f.technique}
                </text>
              )}
            </g>
          ));
        })}
      </svg>
    </div>
  );
}

function parseForRender(data) {
  const result = { strings: [], barPositions: [], maxLen: 0 };
  if (!data || !data.strings || data.strings.length === 0) return result;
  for (const str of data.strings) {
    const content = str.content;
    if (content.length > result.maxLen) result.maxLen = content.length;
    const frets = [];
    let i = 0;
    while (i < content.length) {
      const ch = content[i];
      if (ch >= '0' && ch <= '9') {
        let fretStr = ch;
        if (i + 1 < content.length && content[i + 1] >= '0' && content[i + 1] <= '9') {
          fretStr += content[i + 1];
          i++;
        }
        let technique = null;
        if (i + 1 < content.length) {
          const next = content[i + 1];
          if ('hpsbx~'.includes(next) || next === '/' || next === '\\') {
            technique = next === '\\' ? '\\' : next;
            i++;
          }
        }
        frets.push({ fret: parseInt(fretStr, 10), pos: i - (fretStr.length - 1), technique });
      }
      i++;
    }
    result.strings.push({ note: str.note, frets });
  }
  if (data.strings.length > 0) {
    const content = data.strings[0].content;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '|') result.barPositions.push(i);
    }
  }
  return result;
}
