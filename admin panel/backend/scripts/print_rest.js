const fs = require('fs');
const html = fs.readFileSync('c:/Users/DELL/Downloads/admin/live_website.html', 'utf8');

// Check About
const aboutStart = html.indexOf('id="about"');
const howStart = html.indexOf('id="how-it-works"');
console.log("=== ABOUT ===");
console.log(html.substring(aboutStart, howStart).substring(0, 1500));

// Check FAQs
const faqStart = html.indexOf('id="faqs"');
const footerStart = html.indexOf('<footer');
console.log("=== FAQS ===");
console.log(html.substring(faqStart, footerStart).substring(0, 1500));

// Check Footer
console.log("=== FOOTER ===");
console.log(html.substring(footerStart));
