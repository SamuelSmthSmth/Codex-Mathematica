import re
path = 'src/components/ShopLayoutDiner.tsx'
with open(path, 'r') as f: content = f.read()
content = content.replace('inventoryItems.has(item.id)', 'isItemOwned(item.id)')
content = content.replace('isItemEquipped[category.id] === item.id', 'isItemEquipped(category.id, item.id)')
with open(path, 'w') as f: f.write(content)
