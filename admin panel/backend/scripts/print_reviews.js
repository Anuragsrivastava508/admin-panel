const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

const revStart = html.indexOf('id="reviews"');
const revEnd = html.indexOf('id="faqs"', revStart);
const revHtml = html.substring(revStart, revEnd);

console.log("=== REVIEWS IN LIVE WEBSITE ===");
console.log(revHtml);
