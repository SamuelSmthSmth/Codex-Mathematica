import json
import glob

files = glob.glob('src/data/volumes/**/*.json', recursive=True)
for file in files:
    with open(file, 'r') as f:
        data = json.load(f)
    
    if 'fragments' in data:
        for item in data['fragments']:
            item.pop('difficulty', None)
            item.pop('difficulty_rank', None)
            item.pop('exploit_type', None)
        
    with open(file, 'w') as f:
        json.dump(data, f, indent=2)

print("Cleaned up", len(files), "files.")
