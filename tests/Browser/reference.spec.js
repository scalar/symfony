const { test, expect } = require('@playwright/test');

for (const mode of ['url', 'file', 'content', 'sources']) {
  test(`renders the ${mode} document with the pinned Scalar client`, async ({ page }) => {
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
