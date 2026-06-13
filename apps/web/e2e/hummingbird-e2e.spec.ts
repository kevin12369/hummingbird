import { test, expect } from '@playwright/test';

test('Try-sample 完整流程', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Try sample');
  // 等待 ready
  await page.waitForSelector('[data-testid="download-mp3"]', { timeout: 60000 });
  // 12 风格 chip 渲染
  const styleButtons = await page.locator('[data-style-id]').count();
  expect(styleButtons).toBe(12);
  // stems 按钮可点
  await expect(page.locator('[data-testid="download-stems"]')).toBeEnabled();
});

test('12 风格全部存在', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Try sample');
  await page.waitForSelector('[data-style-id]');
  for (const id of ['pop', 'lofi', 'indie-pop', 'trap', 'drill', 'kpop', 'city-pop', 'house', 'future-bass', 'ambient', 'rnb', 'jazz']) {
    await expect(page.locator(`[data-style-id="${id}"]`)).toBeVisible();
  }
});
