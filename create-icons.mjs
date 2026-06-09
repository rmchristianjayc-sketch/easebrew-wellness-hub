import fs from 'fs';

const svg192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="40" fill="#39613B"/>
  <circle cx="96" cy="85" r="50" fill="#FED255" opacity="0.2"/>
  <text x="96" y="100" font-size="70" text-anchor="middle" fill="#FED255" font-family="Georgia,serif">RM</text>
  <text x="96" y="150" font-size="14" text-anchor="middle" fill="#FED255" font-family="Georgia,serif">EaseBrew</text>
</svg>`;

const svg512 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#39613B"/>
  <circle cx="256" cy="220" r="130" fill="#FED255" opacity="0.2"/>
  <text x="256" y="260" font-size="180" text-anchor="middle" fill="#FED255" font-family="Georgia,serif">RM</text>
  <text x="256" y="400" font-size="42" text-anchor="middle" fill="#FED255" font-family="Georgia,serif">EaseBrew</text>
</svg>`;

fs.writeFileSync('public/icons/icon-192.png', svg192);
fs.writeFileSync('public/icons/icon-512.png', svg512);
fs.writeFileSync('public/icons/icon-192.svg', svg192);
fs.writeFileSync('public/icons/icon-512.svg', svg512);
console.log('Icons created!');