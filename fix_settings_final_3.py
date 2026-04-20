import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace("import { useState } from 'react';", "import React from 'react';")

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/components/Settings.jsx')
