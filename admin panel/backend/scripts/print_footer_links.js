const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

const footerStart = html.indexOf('<footer');
console.log(html.substring(footerStart + 2000, footerStart + 4000));
