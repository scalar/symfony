const { test, expect } = require('@playwright/test');

for (const mode of ['url', 'file', 'content', 'sources']) {
  test(`renders the ${mode} document with the default Scalar client`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/scalar?mode=${mode}`);
    await expect(page.getByRole('heading', { name: 'Fixture API', exact: true })).toBeVisible({ timeout: 30000 });
    if (mode === 'sources') {
      await page.getByRole('button', { name: 'First API', exact: true }).click();
      await page.getByText('Second API', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Second document', exact: true })).toBeVisible();
    }
    if (mode === 'url') {
      await page.getByRole('button', { name: 'Test Request (get /ping)', exact: true }).click();
      const [response] = await Promise.all([
        page.waitForResponse((response) => response.url().endsWith('/api/ping')),
        page.getByRole('button', { name: 'Send get request to http://127.0.0.1:8765/api/ping', exact: true }).click(),
      ]);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({ status: 'ok' });
    }
    expect(errors).toEqual([]);
  });
}

for (const appearance of ['light', 'dark']) {
  for (const width of [1440, 390]) {
    test(`Symfony theme in ${appearance} mode at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/scalar?appearance=${appearance}`);
      await expect(page.getByRole('heading', { name: 'Fixture API', exact: true })).toBeVisible();
      const main = page.getByRole('main', { name: 'API documentation for Fixture API' });
      const palette = await main.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          text: style.getPropertyValue('--scalar-color-1').trim(),
          background: style.getPropertyValue('--scalar-background-1').trim(),
          accent: style.getPropertyValue('--scalar-color-accent').trim(),
        };
      });
      expect(palette).toEqual(appearance === 'light'
        ? { text: '#000000', background: '#ffffff', accent: '#000000' }
        : { text: '#ffffff', background: '#000000', accent: '#ffffff' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`symfony-${appearance}-${width}.png`) });
    });
  }
}

test('another Scalar theme does not inherit Symfony styles', async ({ page }) => {
  await page.goto('/scalar?theme=moon');
  await expect(page.getByRole('heading', { name: 'Fixture API', exact: true })).toBeVisible();
  await expect(page.locator('style[data-scalar-theme="symfony"]')).toHaveCount(0);
});
