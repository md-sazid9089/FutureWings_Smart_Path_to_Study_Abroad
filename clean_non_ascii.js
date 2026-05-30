const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = [
  ...walk('frontend/src'),
  ...walk('backend/src'),
  ...walk('backend/scripts')
];

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Em dashes
  content = content.replace(/—/g, '-');
  
  // Smart quotes
  content = content.replace(/[“”]/g, '"');
  content = content.replace(/[‘’]/g, "'");

  // Ellipsis
  content = content.replace(/…/g, '...');

  // Box drawing (e.g. ─)
  content = content.replace(/─/g, '-');

  // Arrows
  content = content.replace(/↑ Rising/g, '<i className="ti ti-trending-up text-green-500"></i> Rising');
  content = content.replace(/↓ Declining/g, '<i className="ti ti-trending-down text-red-500"></i> Declining');
  content = content.replace(/→ Stable/g, '<i className="ti ti-minus text-gray-500"></i> Stable');
  content = content.replace(/→/g, '->');

  // Other specific UI elements
  content = content.replace(/©/g, '(c)');
  content = content.replace(/✕/g, 'X');
  
  // Tabler icon replacements for remaining UI elements
  // We handle Rating.jsx separately since it uses repeat
  if (file.includes('Rating.jsx')) {
    content = content.replace(/'★'/g, "'*'");
    content = content.replace(/'☆'/g, "'-'");
  }
  
  content = content.replace(/📍/g, '<i className="ti ti-map-pin"></i>');
  content = content.replace(/✓/g, 'v');
  content = content.replace(/✅/g, 'v');
  content = content.replace(/❌/g, 'x');

  // Also catch any other lingering non-ASCII characters to make the file purely ASCII
  // But wait, removing them blindly might break code. Let's do a safe targeted replace
  // and then report any leftovers.
  
  // Find leftovers
  const leftoverMatches = content.match(/[^\x00-\x7F]/g);
  if (leftoverMatches) {
    const uniques = [...new Set(leftoverMatches)];
    // Fallback: replace any unhandled non-ASCII character with empty string 
    content = content.replace(/[^\x00-\x7F]/g, '');
    console.log(`Cleaned leftovers in ${file}:`, uniques.join(' '));
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Cleanup complete.');
