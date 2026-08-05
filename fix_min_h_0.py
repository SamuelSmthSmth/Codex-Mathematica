import os
import re

for filename in os.listdir('src/themes'):
    if not filename.startswith('Theme') or not filename.endswith('.tsx'): continue
    path = os.path.join('src/themes', filename)
    with open(path, 'r') as f: content = f.read()
    
    # Add min-h-0 to any flex-1 element
    content = content.replace('flex-1 flex flex-col', 'flex-1 min-h-0 flex flex-col')
    content = content.replace('flex-1 relative overflow-hidden', 'flex-1 min-h-0 relative overflow-hidden')
    content = content.replace('flex-1 overflow-hidden', 'flex-1 min-h-0 overflow-hidden')
    
    with open(path, 'w') as f: f.write(content)

