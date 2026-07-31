const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Convert Arabic to Roman numerals (up to XL)
function toRoman(num) {
  const val = [40, 10, 9, 5, 4, 1];
  const syb = ["XL", "X", "IX", "V", "IV", "I"];
  let roman = "";
  let i = 0;
  while (num > 0) {
    while (num >= val[i]) {
      roman += syb[i];
      num -= val[i];
    }
    i++;
  }
  return roman;
}

// Map the roman numeral to a tier name
function generateChapterName(index, category) {
  const rank = toRoman(index + 1);
  const descriptors = {
    'Limit': 'Asymptotic Bounds',
    'Differentiation': 'Rates of Change',
    'Summation': 'Discrete Accumulation',
    'Integration': 'Continuous Areas'
  };
  return `Rank ${rank}: ${descriptors[category] || 'The Unknown'}`;
}

async function processDataset() {
  const datasetPath = path.join(__dirname, 'july_dataset.jsonl');
  const fileStream = fs.createReadStream(datasetPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const categories = {
    'Limit': [],
    'Differentiation': [],
    'Summation': [],
    'Integration': []
  };

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // Map JSONL fields to expected fragment fields
      const fragment = {
        id: obj.id, // e.g. "INT_0320" -> string, we might need to parse to int or keep as string. Let's look at codex-data.ts: Fragment id is number. 
        // Wait, july_dataset has string IDs like "INT_0320". We'll generate a unique numeric ID for the UI or parse it.
        // Actually, we can use an auto-incrementing ID for the UI or parse the numeric part.
        // Let's just use auto-increment per volume to ensure they are numeric and sequential.
        original_id: obj.id,
        problem_latex: obj.problem_latex || obj.problem,
        solution_latex: obj.solution_latex || obj.solution,
        problem_raw: obj.problem_latex || obj.problem, // Fallback if no raw string
        solution_raw: obj.solution_latex || obj.solution,
        difficulty_rank: obj.difficulty_rank || 0,
        difficulty: obj.difficulty,
        exploit_type: obj.exploit_type
      };

      if (categories[obj.category]) {
        categories[obj.category].push(fragment);
      }
    } catch (e) {
      console.error('Error parsing line:', line);
    }
  }

  // Define files for output
  const outFiles = {
    'Limit': 'alpha.json',
    'Differentiation': 'delta.json',
    'Summation': 'sigma.json',
    'Integration': 'gamma.json'
  };

  for (const [category, items] of Object.entries(categories)) {
    // Sort by difficulty rank
    items.sort((a, b) => a.difficulty_rank - b.difficulty_rank);

    // Limit to 1000 items (40 chapters * 25 fragments)
    const sliced = items.slice(0, 1000);

    const chapters = [];
    let currentFragmentId = 1;

    for (let i = 0; i < 40; i++) {
      const chapterFragments = sliced.slice(i * 25, (i + 1) * 25).map(f => {
        return {
          ...f,
          id: currentFragmentId++ // UI expects a numeric ID
        };
      });

      if (chapterFragments.length > 0) {
        chapters.push({
          theme: generateChapterName(i, category),
          fragments: chapterFragments
        });
      }
    }

    const outputData = { chapters };
    const outputPath = path.join(__dirname, outFiles[category]);
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Wrote ${chapters.length} chapters (${sliced.length} fragments) to ${outFiles[category]}`);
  }
}

processDataset().catch(console.error);
