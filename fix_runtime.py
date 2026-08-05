import re

# 1. Fix useShopLogic.ts
path = 'src/hooks/useShopLogic.ts'
with open(path, 'r') as f: content = f.read()

# Add itemsByCategory logic before return
items_by_cat_logic = """
  const itemsByCategory = useMemo(() => {
    return SHOP_CATEGORIES.map(cat => ({
      category: cat,
      items: SHOP_ITEMS.filter(i => i.category === cat.id)
    }));
  }, []);
  
  return {
"""

content = content.replace('  return {', items_by_cat_logic)
content = content.replace('itemsByCategory: filteredItems', 'itemsByCategory')

with open(path, 'w') as f: f.write(content)

# 2. Fix useLibraryLogic.ts
path = 'src/hooks/useLibraryLogic.ts'
with open(path, 'r') as f: content = f.read()

content = content.replace('techniqueRows: TECHNIQUE_ROWS,', 'techniqueRows: TECHNIQUE_ROWS,\n    TECHNIQUE_ROWS,')

with open(path, 'w') as f: f.write(content)
