def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Make arrange tab blocks borderless/soft
    content = content.replace(
        'bg-[var(--ds-background-100)] border-x border-b border-[var(--ds-gray-200)] flex flex-col',
        'bg-[var(--ds-background-200)] rounded-lg ring-1 ring-[var(--ds-gray-200)]/50 flex flex-col mb-4'
    )
    content = content.replace(
        'border border-[var(--ds-teal-500)]',
        'ring-2 ring-[var(--ds-teal-500)]'
    )

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/components/editor/ArrangeTab.jsx')
