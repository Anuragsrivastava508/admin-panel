const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

// Search for mentions of circuits, routes, yatra, etc.
const keywords = ['circuit', 'package', 'tour', 'yatra', 'expedition', 'destination'];
for (const kw of keywords) {
  const regex = new RegExp(`([^.!?\\n]*?${kw}[^.!?\\n]*)`, 'gi');
  const matches = [...html.matchAll(regex)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  const unique = [...new Set(matches)];
  console.log(`=== Matches for "${kw}" (${unique.length}) ===`);
  console.log(unique.slice(0, 10));
}
