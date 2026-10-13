const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

const selStart = html.indexOf('id="q-destination"');
const selEnd = html.indexOf('</select>', selStart);
console.log(html.substring(selStart, selEnd + 9));
