import re
with open('src/themes/ThemeScribble.tsx', 'r') as f: content = f.read()

# Make the outer wrapper flex-1 flex flex-col min-h-0
content = content.replace('className="w-full h-full p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16"', 'className="w-full flex-1 flex flex-col min-h-0 p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16"')

# Make the inner wrapper flex-1 flex flex-col min-h-0
content = content.replace('className="bg-white rounded-lg overflow-hidden h-full border-[4px] border-stone-800"', 'className="bg-white rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 border-[4px] border-stone-800"')

# Also fix the top level child of ScribbleBackground
content = content.replace('className="relative z-10 w-full h-full flex flex-col max-w-6xl mx-auto"', 'className="relative z-10 w-full flex-1 flex flex-col min-h-0 max-w-6xl mx-auto"')

with open('src/themes/ThemeScribble.tsx', 'w') as f: f.write(content)

# Fix ShopLayoutScribble
with open('src/components/ShopLayoutScribble.tsx', 'r') as f: content2 = f.read()
content2 = content2.replace('className="h-full p-4 md:p-8 bg-[#fdf7ee] overflow-y-auto"', 'className="flex-1 min-h-0 p-4 md:p-8 bg-[#fdf7ee] overflow-y-auto"')
with open('src/components/ShopLayoutScribble.tsx', 'w') as f: f.write(content2)

# Fix LibraryViewScribble
with open('src/components/LibraryViewScribble.tsx', 'r') as f: content3 = f.read()
content3 = content3.replace('className="h-full p-4 md:p-8 bg-[#fdf7ee] overflow-y-auto"', 'className="flex-1 min-h-0 p-4 md:p-8 bg-[#fdf7ee] overflow-y-auto"')
with open('src/components/LibraryViewScribble.tsx', 'w') as f: f.write(content3)

