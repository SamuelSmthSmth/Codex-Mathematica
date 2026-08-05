import re
with open('src/themes/ThemeScribble.tsx', 'r') as f: content = f.read()

# Revert h-full to min-h-screen in ScribbleBackground
content = content.replace('className="h-full flex flex-col items-center pt-24', 'className="min-h-screen flex flex-col items-center pt-24')

# Revert flex-1 back to h-full for the outer wrappers in ThemeScribble
content = content.replace('className="relative z-10 w-full flex-1 flex flex-col max-w-6xl mx-auto"', 'className="relative z-10 w-full h-full flex flex-col max-w-6xl mx-auto"')
content = content.replace('className="w-full flex-1 flex flex-col min-h-0 p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16 relative"', 'className="w-full h-full p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16"')
content = content.replace('className="bg-white rounded-lg overflow-hidden flex-1 min-h-0 relative border-[4px] border-stone-800"', 'className="bg-white rounded-lg overflow-hidden h-full border-[4px] border-stone-800"')

with open('src/themes/ThemeScribble.tsx', 'w') as f: f.write(content)

# Revert absolute inset-0 in ShopLayoutScribble
with open('src/components/ShopLayoutScribble.tsx', 'r') as f: content2 = f.read()
content2 = content2.replace('absolute inset-0', 'h-full')
with open('src/components/ShopLayoutScribble.tsx', 'w') as f: f.write(content2)

# Revert absolute inset-0 in LibraryViewScribble
with open('src/components/LibraryViewScribble.tsx', 'r') as f: content3 = f.read()
content3 = content3.replace('absolute inset-0', 'h-full')
with open('src/components/LibraryViewScribble.tsx', 'w') as f: f.write(content3)

