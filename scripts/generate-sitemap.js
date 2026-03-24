const fs = require('fs');
const path = require('path');

const ROUTES = [
  '',
  '/play',
  '/world-map-quiz',
  '/africa-map-quiz',
  '/asia-map-quiz',
  '/europe-map-quiz',
  '/north-america-map-quiz',
  '/south-america-map-quiz',
  '/oceania-map-quiz'
];

const DOMAIN = 'https://mappil.com';

function generateSitemap() {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((route) => `  <url>
    <loc>${DOMAIN}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  const buildPath = path.join(__dirname, '..', 'build');
  const publicPath = path.join(__dirname, '..', 'public');
  
  // Also write to public so it's available pre-build for dev mode if needed
  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemapContent);
  
  // Write to build dir if it exists (for postbuild)
  if (fs.existsSync(buildPath)) {
    fs.writeFileSync(path.join(buildPath, 'sitemap.xml'), sitemapContent);
  }
  
  console.log('✅ Generated sitemap.xml');
}

generateSitemap();
