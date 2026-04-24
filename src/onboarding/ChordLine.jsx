export default function ChordLine({ line, animateKey }) {
  const parts = [];
  const re = /(\[[^\]]+\])/g;
  let lastIndex = 0;
  let match;
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'lyric', text: line.slice(lastIndex, match.index) });
    parts.push({ type: 'chord', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push({ type: 'lyric', text: line.slice(lastIndex) });

  let chordIdx = 0;
  return (
    <div className="text-copy-14 leading-loose">
      {parts.map((p, i) => {
        if (p.type === 'chord') {
          const delay = chordIdx * 30;
          chordIdx += 1;
          return (
            <span
              key={`${animateKey ?? 0}-${i}`}
              className="font-bold inline-block sm-onboard-chord-pop"
              style={{
                color: 'var(--chord)',
                animationDelay: `${delay}ms`,
              }}
            >
              {p.text}
            </span>
          );
        }
        return (
          <span key={i} className="text-[var(--ds-gray-900)]">{p.text}</span>
        );
      })}
    </div>
  );
}
