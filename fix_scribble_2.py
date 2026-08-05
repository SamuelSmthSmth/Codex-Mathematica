import re
with open('src/themes/ThemeScribble.tsx', 'r') as f: content = f.read()

# Make the outer wrapper flex flex-col
content = content.replace('<div className="w-full flex-1 p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16 relative">', '<div className="w-full flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16 relative">')

# Make the inner wrapper flex-1 instead of h-full
content = content.replace('className="bg-white rounded-lg overflow-hidden h-full relative border-[4px] border-stone-800"', 'className="bg-white rounded-lg overflow-hidden flex-1 relative border-[4px] border-stone-800"')

with open('src/themes/ThemeScribble.tsx', 'w') as f: f.write(content)
