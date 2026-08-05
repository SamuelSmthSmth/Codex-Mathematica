import re

# ThemeDiner - content wrapper uses h-[calc(100%-4rem)], inner wrappers use h-full
# Fix: outer wrapper keeps h-[calc(100%-4rem)] but add flex flex-col
# inner wrappers change h-full to flex-1 min-h-0
with open('src/themes/ThemeDiner.tsx') as f: c = f.read()
# Make the wrapper a flex container
c = c.replace(
    'className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100%-4rem)] w-full"',
    'className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100%-4rem)] w-full flex flex-col"'
)
# Fix content inner wrappers (the padding divs) to be flex-1 min-h-0 flex flex-col
c = c.replace(
    '<div className="w-full h-full p-8 max-w-6xl mx-auto">',
    '<div className="flex-1 min-h-0 flex flex-col p-8 max-w-6xl mx-auto w-full">'
)
c = c.replace(
    'className="bg-[#fdfbe9] rounded-lg shadow-2xl overflow-hidden h-full border-4 border-stone-300"',
    'className="bg-[#fdfbe9] rounded-lg shadow-2xl overflow-hidden flex-1 min-h-0 border-4 border-stone-300"'
)
with open('src/themes/ThemeDiner.tsx', 'w') as f: f.write(c)
print("Fixed ThemeDiner")

# ThemeMixtape - wrapper is h-[calc(100%-4rem)], ShopLayoutMixtape/LibraryViewMixtape have h-full
with open('src/themes/ThemeMixtape.tsx') as f: c = f.read()
c = c.replace(
    'className="animate-in fade-in slide-in-from-left-4 duration-500 h-[calc(100%-4rem)] w-full"',
    'className="animate-in fade-in slide-in-from-left-4 duration-500 h-[calc(100%-4rem)] w-full flex flex-col"'
)
with open('src/themes/ThemeMixtape.tsx', 'w') as f: f.write(c)
print("Fixed ThemeMixtape")

