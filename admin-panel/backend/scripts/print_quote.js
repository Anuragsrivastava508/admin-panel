const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

const quoteStart = html.indexOf('id="quote-estimator"');
const quoteEnd = html.indexOf('id="fleet"', quoteStart);
console.log(html.substring(quoteStart, quoteEnd));
