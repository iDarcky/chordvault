import re

with open("src/components/SongCard.jsx", "r") as f:
    content = f.read()

# Update SongCard row variant to match the new "zen" aesthetic
# 1. Update the wrapper classes to add border-b transparent and hover state matching setlist items
content = content.replace(
    '"flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-150 hover:bg-[var(--bg-2)]"',
    '"group relative flex items-center justify-between px-5 py-4 cursor-pointer transition-all duration-200 border-b border-transparent hover:bg-[var(--bg-2)]"'
)

# 2. Update the song title to serif
content = content.replace(
    'className="text-heading-16 text-[var(--text-1)] truncate"',
    'className="text-lg font-serif tracking-tight text-[var(--text-1)] truncate"'
)

# 3. Update the song artist to serif italic
content = content.replace(
    'className="text-copy-14 text-[var(--color-brand)] truncate"',
    'className="text-sm font-serif italic text-[var(--color-brand)] truncate"'
)

# 4. Make tags completely borderless and softer
content = content.replace(
    'className="text-label-11 text-[var(--text-2)] px-2 py-0.5 rounded-md border border-[var(--border-1)] bg-[var(--bg-1)]"',
    'className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-2)] px-2 py-0.5 rounded-full bg-[var(--bg-2)]"'
)

# 5. Make the BPM and Key text smaller/tighter and remove the bullet if possible, or just style them
content = content.replace(
    'className="text-label-12 font-bold text-[var(--color-brand)]"',
    'className="text-xs font-bold text-[var(--color-brand)]"'
)
content = content.replace(
    'className="text-copy-12 text-[var(--text-2)]"',
    'className="text-xs text-[var(--text-2)] opacity-80"'
)

with open("src/components/SongCard.jsx", "w") as f:
    f.write(content)
