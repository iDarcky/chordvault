import re

def check_file_content(file_path, patterns):
    with open(file_path, 'r') as f:
        content = f.read()
        for pattern in patterns:
            if not re.search(pattern, content):
                print(f"FAILED: Pattern '{pattern}' not found in {file_path}")
                return False
    print(f"PASSED: All patterns found in {file_path}")
    return True

css_patterns = [
    r'@import "tailwindcss"',
    r'--ds-background-100: #000000',
    r'--ds-background-200: #000000',
    r'--ds-background-100: #ffffff',
    r'--ds-background-200: #ffffff',
    r'--font-sans: \'Inter\'',
    r'--font-serif: \'Lora\''
]

check_file_content('src/styles/index.css', css_patterns)
