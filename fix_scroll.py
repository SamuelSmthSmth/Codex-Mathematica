import os
import re

for filename in os.listdir('src/components'):
    if not (filename.startswith('ShopLayout') or filename.startswith('LibraryView')): continue
    if filename.endswith('Default.tsx'): continue
    
    path = os.path.join('src/components', filename)
    with open(path, 'r') as f: content = f.read()
    
    # Just replace "h-full " with "absolute inset-0 " on the first div that has overflow-y-auto
    # Or actually, we can just replace "h-full" or "min-h-full" in the root div with "absolute inset-0"
    
    # A robust way is to find the return statement and replace the first div's classes
    content = re.sub(r'(return\s*\(\s*<div\s+className="[^"]*)(min-h-full|h-full)([^"]*overflow-y-auto[^"]*")', r'\1absolute inset-0\3', content)
    
    with open(path, 'w') as f: f.write(content)

