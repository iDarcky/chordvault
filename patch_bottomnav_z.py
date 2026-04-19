import re

with open('src/components/BottomNav.jsx', 'r') as f:
    content = f.read()

# Increase z-index of BottomNav to 200 to ensure it's not hidden behind DesktopLayout's flex containers
content = content.replace("z-[100]", "z-[200]")

with open('src/components/BottomNav.jsx', 'w') as f:
    f.write(content)
print("BottomNav.jsx updated")
