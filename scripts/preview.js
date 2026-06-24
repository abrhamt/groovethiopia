// Capture screenshots of every key page for preview
const { chromium } = require('playwright');
const fs = require('fs');

const PAGES = [
  { url: '/en', name: '01-home-en', wait: 3000 },
  { url: '/en/about', name: '02-about-en', wait: 2000 },
  { url: '/en/divisions', name: '03-divisions-en', wait: 3000 },
  { url: '/en/events', name: '04-events-en', wait: 3000 },
  { url: '/en/events/shukshuta-speakeasy', name: '05-event-detail', wait: 3000 },
  { url: '/en/collection', name: '06-collection-en', wait: 3000 },
  { url: '/en/collection/2024-bentley-continental-gt', name: '07-vehicle-detail', wait: 3000 },
  { url: '/en/sanctuary', name: '08-sanctuary-en', wait: 3000 },
  { url: '/en/gallery', name: '09-gallery-en', wait: 3000 },
  { url: '/en/partners', name: '10-partners-en', wait: 3000 },
  { url: '/en/contact', name: '11-contact-en', wait: 2000 },
  { url: '/fr', name: '12-home-fr', wait: 3000 },
  { url: '/am', name: '13-home-am', wait: 3000 },
  { url: '/en/search?q=shukshuta', name: '14-search', wait: 2000 },
  { url: '/admin/login', name: '15-admin-login', wait: 1000 },
];

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  fs.mkdirSync('/workspace/groovethiopia/previews', { recursive: true });

  for (const p of PAGES) {
    try {
      console.log(`Capturing ${p.url}...`);
      await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(p.wait);
      await page.screenshot({
        path: `/workspace/groovethiopia/previews/${p.name}.png`,
        fullPage: true,
      });
      console.log(`  ✓ ${p.name}.png`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e.message}`);
    }
  }

  // Mobile capture of homepage
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: '/workspace/groovethiopia/previews/16-home-mobile.png',
      fullPage: true,
    });
    console.log('  ✓ 16-home-mobile.png');
  } catch (e) {
    console.error(`  ✗ mobile: ${e.message}`);
  }

  await browser.close();
  console.log('\n✅ All previews captured in /workspace/groovethiopia/previews/');
})();