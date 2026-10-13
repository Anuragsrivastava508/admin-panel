const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

const fleetStart = html.indexOf('id="fleet"');
console.log(html.substring(fleetStart, fleetStart + 4000));
