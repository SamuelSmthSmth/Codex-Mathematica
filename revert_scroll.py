import os
import re

for filename in os.listdir('src/components'):
    if not (filename.startswith('ShopLayout') or filename.startswith('LibraryView')): continue
    if filename.endswith('Default.tsx'): continue
    
    path = os.path.join('src/components', filename)
    with open(path, 'r') as f: content = f.read()
    
    # Revert absolute inset-0 back to h-full
    content = content.replace('absolute inset-0', 'h-full')
    
    with open(path, 'w') as f: f.write(content)

