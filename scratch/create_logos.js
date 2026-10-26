const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'dashboard', 'public', 'team-logos');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const logos = {
  'renault.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 85,50 50,95 15,50" fill="none" stroke="#fff000" stroke-width="12" stroke-linejoin="miter"/><polygon points="50,22 72,50 50,78 28,50" fill="#111111"/></svg>',
  'benetton.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><rect width="120" height="60" rx="8" fill="#00a850"/><circle cx="40" cy="30" r="16" fill="none" stroke="#ffffff" stroke-width="6"/><circle cx="80" cy="30" r="16" fill="none" stroke="#ffffff" stroke-width="6"/><line x1="40" y1="30" x2="80" y2="30" stroke="#ffffff" stroke-width="6"/><text x="60" y="54" font-family="monospace" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">BENETTON</text></svg>',
  'brawn.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><rect width="120" height="60" rx="8" fill="#ffffff" stroke="#000000" stroke-width="2"/><circle cx="35" cy="30" r="18" fill="#d2f500"/><path d="M25,20 L45,30 L25,40 Z" fill="#000000"/><text x="75" y="35" font-family="sans-serif" font-size="14" font-weight="900" fill="#000000">BRAWN</text></svg>',
  'racing-point.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#f596c8"/><text x="50" y="38" font-family="sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">RP</text></svg>',
  'force-india.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#f58220"/><rect x="0" y="30" width="100" height="30" rx="0" fill="#008000"/><text x="50" y="38" font-family="sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">FORCE INDIA</text></svg>',
  'toro-rosso.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#001a30"/><circle cx="50" cy="30" r="20" fill="#002b80" stroke="#cc0000" stroke-width="3"/><text x="50" y="36" font-family="sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">STR</text></svg>',
  'alphatauri.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#00293f"/><circle cx="50" cy="28" r="16" fill="none" stroke="#ffffff" stroke-width="3"/><polygon points="50,16 58,32 42,32" fill="#ffffff"/><text x="50" y="52" font-family="sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">ALPHATAURI</text></svg>',
  'bmw-sauber.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#ffffff" stroke="#002663" stroke-width="2"/><circle cx="50" cy="30" r="18" fill="#002663"/><path d="M50,12 A18,18 0 0,1 68,30 L50,30 Z" fill="#0099ff"/><path d="M32,30 A18,18 0 0,1 50,48 L50,30 Z" fill="#0099ff"/></svg>',
  'lotus.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#004225" stroke="#ffcc00" stroke-width="4"/><circle cx="50" cy="50" r="32" fill="#ffcc00"/><text x="50" y="56" font-family="serif" font-size="14" font-weight="bold" fill="#004225" text-anchor="middle">LOTUS</text></svg>',
  'toyota.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#ffffff" stroke="#eb0a1e" stroke-width="2"/><ellipse cx="50" cy="30" rx="30" ry="18" fill="none" stroke="#eb0a1e" stroke-width="4"/><ellipse cx="50" cy="24" rx="14" ry="10" fill="none" stroke="#eb0a1e" stroke-width="4"/><line x1="50" y1="12" x2="50" y2="48" stroke="#eb0a1e" stroke-width="4"/></svg>',
  'jordan.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#ffcc00"/><text x="50" y="38" font-family="sans-serif" font-size="18" font-weight="900" fill="#000000" text-anchor="middle">JORDAN</text></svg>',
  'jaguar.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#005a36"/><text x="50" y="36" font-family="serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">JAGUAR</text></svg>',
  'alfa-romeo.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#8b0000" stroke="#ffffff" stroke-width="3"/><line x1="50" y1="20" x2="50" y2="80" stroke="#ffffff" stroke-width="3"/><line x1="20" y1="50" x2="80" y2="50" stroke="#ffffff" stroke-width="3"/><circle cx="65" cy="50" r="8" fill="#004488"/></svg>',
  'sauber.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#002b49"/><text x="50" y="38" font-family="sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle">SAUBER</text></svg>'
};

for (const [name, content] of Object.entries(logos)) {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  console.log('Created logo:', name);
}
console.log('Finished writing historical team logos.');
