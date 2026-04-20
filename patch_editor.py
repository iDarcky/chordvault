def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Redesign editor into a zen mode
    content = content.replace(
        'bg-[var(--ds-background-100)] rounded-xl border border-[var(--ds-gray-200)] flex flex-col overflow-hidden',
        'bg-transparent border-none flex flex-col overflow-hidden'
    )
    content = content.replace(
        'border-r border-[var(--ds-gray-200)] flex-shrink-0 relative overflow-y-auto',
        'border-r border-[var(--ds-gray-200)]/50 flex-shrink-0 relative overflow-y-auto'
    )
    content = content.replace(
        'className="bg-[var(--ds-background-200)] flex-1 min-h-[50vh] focus:outline-none p-4 pb-[200px] text-copy-14-mono font-mono text-[var(--ds-gray-1000)]"',
        'className="bg-[var(--ds-background-100)] border border-[var(--ds-gray-200)]/50 rounded-lg flex-1 min-h-[50vh] focus:outline-none p-4 pb-[200px] text-copy-14-mono font-mono text-[var(--ds-gray-1000)] transition-all focus:ring-2 focus:ring-[var(--ds-teal-500)]"'
    )

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/components/editor/WriteTab.jsx')
