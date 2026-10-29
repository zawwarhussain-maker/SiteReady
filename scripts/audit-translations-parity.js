import fs from 'fs';

const content = fs.readFileSync('src/lib/translations.ts', 'utf8');

// Match keys in en
const enBlockMatch = content.match(/en:\s*\{([\s\S]*?)\n\s*\},/);
const arBlockMatch = content.match(/ar:\s*\{([\s\S]*?)\n\s*\}\s*\n\};/);

if (!enBlockMatch || !arBlockMatch) {
  console.error('Could not find en or ar blocks!');
  process.exit(1);
}

function extractKeys(block) {
  const keys = new Set();
  const lines = block.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const match = trimmed.match(/^([a-zA-Z0-9_]+):/);
    if (match) {
      keys.add(match[1]);
    }
  }
  return keys;
}

const enKeys = extractKeys(enBlockMatch[1]);
const arKeys = extractKeys(arBlockMatch[1]);

console.log(`EN Keys count: ${enKeys.size}`);
console.log(`AR Keys count: ${arKeys.size}`);

const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
const missingInEn = [...arKeys].filter(k => !enKeys.has(k));

if (missingInAr.length > 0) {
  console.error('Missing in AR:', missingInAr);
} else {
  console.log('✓ All EN keys present in AR');
}

if (missingInEn.length > 0) {
  console.error('Missing in EN:', missingInEn);
} else {
  console.log('✓ All AR keys present in EN');
}
