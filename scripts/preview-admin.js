// Capture admin pages (requires login)
const { chromium } = require('playwright');
const fs = require('fs');

const ADMIN_PAGES = [
  { url: '/dashboard', name: 'admin-01-dashboard' },
  { url: '/review', name: 'admin-02-review' },
  { url: '/events', name: 'admin-03-events' },
  { url: '/events/new', name: 'admin-04-event-new' },
  { url: '/vehicles', name: 'admin-05-vehicles' },
  { url: '/real-estate', name: 'admin-06-real-estate' },
  { url: '/shukshuta', name: 'admin-07-shukshuta' },
  { url: '/gallery', name: 'admin-08-gallery' },
  { url: '/partners', name: 'admin-09-partners' },
  { url: '/inquiries', name: 'admin-10-inquiries' },
  { url: '/users', name: 'admin-11-users' },
  { url: '/pages', name: 'admin-12-pages' },
  { url: '/settings', name: 'admin-13-settings' },
];

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  fs.mkdirSync('/workspace/groovethiopia/previews', { recursive: true });

  // Step 1: Log in
  console.log('Logging in to admin...');
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  // Use evaluate to fill — form may hydrate after page load
  await page.locator('input[name="email"]').waitFor({ timeout: 15000 });
  await page.fill('input[name="email"]', 'admin@groovethiopia.com');
  await page.fill('input[name="password"]', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log('  ✓ Logged in');

  // Step 2: Capture each page
  for (const p of ADMIN_PAGES) {
    try {
      console.log(`Capturing ${p.url}...`);
      await page.goto(`http://localhost:3001${p.url}`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `/workspace/groovethiopia/previews/${p.name}.png`,
        fullPage: true,
      });
      console.log(`  ✓ ${p.name}.png`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Admin previews captured');
})();