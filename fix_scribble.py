import re
with open('src/themes/ThemeScribble.tsx', 'r') as f: content = f.read()

# Make ScribbleBackground flex-1 instead of h-full
content = content.replace('className="relative z-10 w-full h-full flex flex-col', 'className="relative z-10 w-full flex-1 flex flex-col')

# Ensure the content wrapper has flex-1 instead of just h-full
content = content.replace('<div className="w-full h-full p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16">', '<div className="w-full flex-1 p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16 relative">')

with open('src/themes/ThemeScribble.tsx', 'w') as f: f.write(content)
