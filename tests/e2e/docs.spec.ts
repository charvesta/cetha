import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the Astro-native catalogue without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await expect(page.getByRole('heading', { name: /Clear interfaces/i })).toBeVisible();
  await expect(page.getByText('Astro-native · SSR-safe')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Forms' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('toggles password visibility while preserving its value', async ({ page }) => {
  const password = page.getByLabel('API secret');
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Show secret' }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('Cetha-is-clear');
  await page.getByRole('button', { name: 'Hide secret' }).click();
  await expect(password).toHaveAttribute('type', 'password');
});

test('opens and closes native dialog with focus return', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open dialog' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Edit workspace' });
  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('supports dropdown and tabs keyboard navigation', async ({ page }) => {
  const actions = page.locator('#actions > summary');
  await actions.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(actions).toBeFocused();

  const general = page.getByRole('tab', { name: 'General' });
  await general.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Security' })).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: 'Security' })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: 'General' })).toBeHidden();
});

test('toggles sidebar and announces toast', async ({ page }) => {
  const sidebarToggle = page.getByRole('button', { name: 'Toggle navigation' });
  await sidebarToggle.click();
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('button', { name: 'Show toast' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Configuration saved' })).toBeVisible();
});

test('uses compact control density and switches the scoped color mode', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Small' })).toHaveCSS('height', '32px');
  await expect(page.getByRole('button', { name: 'Default' })).toHaveCSS('height', '36px');
  await expect(page.getByRole('button', { name: 'Large' })).toHaveCSS('height', '40px');
  await expect(page.getByLabel('Small input')).toHaveCSS('height', '32px');
  await expect(page.getByLabel('Default input')).toHaveCSS('height', '36px');
  await expect(page.getByLabel('Large input')).toHaveCSS('height', '40px');

  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-cetha-mode', 'light');
  await expect(root).toHaveAttribute('data-cetha-theme', 'default');
  await page.getByRole('button', { name: /Dark mode/ }).click();
  await expect(root).toHaveAttribute('data-cetha-mode', 'dark');
  await expect(page.getByRole('button', { name: /Light mode/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 19, 22)');
});

test('keeps focus treatment and icon geometry aligned', async ({ page }) => {
  const defaultButton = page.getByRole('button', { name: 'Default' });
  await defaultButton.focus();
  await expect(defaultButton).toHaveCSS('outline-style', 'solid');
  await expect(defaultButton).toHaveCSS('outline-width', '2px');

  const icons = page.locator('.icon-demo svg');
  await expect(icons).toHaveCount(15);
  for (const icon of await icons.all()) {
    await expect(icon).toHaveAttribute('viewBox', '0 0 256 256');
    await expect(icon).toHaveCSS('flex-shrink', '0');
  }
});

test('matches the component catalogue visual baseline', async ({ page }, testInfo) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot(`catalogue-${testInfo.project.name}.png`, {
    fullPage: true,
    animations: 'disabled',
  });
});
