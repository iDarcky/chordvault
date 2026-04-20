import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Redesign Settings list as a drill-down list like mymind
    content = content.replace('border-[var(--ds-gray-400)]', 'border-none')
    content = content.replace('divide-[var(--ds-gray-400)]', 'divide-[var(--ds-gray-200)]')

    # Fix the detectingKey logic that was missing the usage
    content = content.replace(
        '''<Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDetectKey('pedalPrev')}
                  className="w-32 bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]"
                >
                  {settings.pedalPrev || 'Press a key...'}
                </Button>''',
        '''<Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDetectKey('pedalPrev')}
                  className="w-32 bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]"
                >
                  {detectingKey === 'pedalPrev' ? 'Listening...' : (settings.pedalPrev || 'Press a key...')}
                </Button>'''
    )
    content = content.replace(
        '''<Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDetectKey('pedalNext')}
                  className="w-32 bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]"
                >
                  {settings.pedalNext || 'Press a key...'}
                </Button>''',
        '''<Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDetectKey('pedalNext')}
                  className="w-32 bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]"
                >
                  {detectingKey === 'pedalNext' ? 'Listening...' : (settings.pedalNext || 'Press a key...')}
                </Button>'''
    )

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/components/Settings.jsx')
