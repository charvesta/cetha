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
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => {
      const active = document.activeElement;
      return active === document.body || (active instanceof Element && Boolean(active.closest('#edit-dialog')));
    })).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => {
    const active = document.activeElement;
    return active === document.body || (active instanceof Element && Boolean(active.closest('#edit-dialog')));
  })).toBe(true);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
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

test('delegates outside clicks across dropdowns and animates entry', async ({ page }) => {
  const actions = page.locator('#actions');
  const clone = await page.evaluate(() => {
    const source = document.querySelector<HTMLDetailsElement>('#actions');
    if (!source) return false;
    const copy = source.cloneNode(true) as HTMLDetailsElement;
    copy.id = 'actions-copy';
    source.after(copy);
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
    source.open = true;
    copy.open = true;
    return true;
  });
  expect(clone).toBe(true);
  await expect(actions).toHaveAttribute('open', '');
  await expect(page.locator('#actions-copy')).toHaveAttribute('open', '');
  await page.locator('#overlays > header').click({ position: { x: 2, y: 2 } });
  await expect(actions).not.toHaveAttribute('open', '');
  await expect(page.locator('#actions-copy')).not.toHaveAttribute('open', '');

  await actions.locator('summary').click();
  await expect(actions.locator('[data-cetha-dropdown-menu]')).toHaveCSS('animation-name', 'cetha-dropdown-in');
});

test('reduces dropdown motion when requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const actions = page.locator('#actions');
  await actions.locator('summary').click();
  const duration = await actions.locator('[data-cetha-dropdown-menu]').evaluate((menu) => Number.parseFloat(getComputedStyle(menu).animationDuration));
  expect(duration).toBeLessThanOrEqual(0.001);
});

test('supports native disclosure and contextual floating content', async ({ page }) => {
  const question = page.getByText('Can I change my plan?');
  const accordionItem = question.locator('xpath=ancestor::details');
  await expect(accordionItem).toHaveAttribute('open', '');
  await question.click();
  await expect(accordionItem).not.toHaveAttribute('open', '');

  const advanced = page.getByText('Advanced options');
  await advanced.click();
  await expect(page.getByText('Configure tax rounding and invoice numbering.')).toBeVisible();

  const popover = page.locator('#filter-popover');
  await page.getByText('Filter options').click();
  await expect(popover).toHaveAttribute('open', '');
  await expect(page.getByRole('dialog').filter({ hasText: 'Report period' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popover).not.toHaveAttribute('open', '');
  await expect(popover.locator('summary')).toBeFocused();

  const exportButton = page.getByRole('button', { name: 'Export report' });
  await exportButton.focus();
  await expect(page.getByRole('tooltip', { name: 'Download report as CSV' })).toBeVisible();
});

test('switches tabs on click and moves the active visual state', async ({ page }) => {
  const general = page.getByRole('tab', { name: 'General' });
  const security = page.getByRole('tab', { name: 'Security' });
  await security.click();
  await expect(security).toHaveAttribute('aria-selected', 'true');
  await expect(general).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel', { name: 'Security' })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: 'General' })).toBeHidden();
  await expect(security).toHaveCSS('border-bottom-color', 'rgb(79, 70, 229)');
});

test('removes breadcrumb markers and gives table cells horizontal padding', async ({ page }) => {
  const breadcrumbList = page.getByRole('navigation', { name: 'Breadcrumb' }).locator('ol');
  await expect(breadcrumbList).toHaveCSS('list-style-type', 'none');
  await expect(breadcrumbList).toHaveCSS('padding-left', '0px');
  const firstHeader = page.getByRole('columnheader', { name: 'Deployment' });
  const firstCell = page.getByRole('cell', { name: 'web-production-248' });
  await expect(firstHeader).toHaveCSS('padding-left', '16px');
  await expect(firstCell).toHaveCSS('padding-left', '16px');
});

test('manages sidebar state, focus return, backdrop, scroll lock, and events', async ({ page }, testInfo) => {
  const sidebarToggle = page.getByRole('button', { name: 'Toggle navigation' });
  await page.evaluate(() => {
    const sidebar = document.querySelector('#workspace-sidebar');
    (window as typeof window & { sidebarEvents: boolean[] }).sidebarEvents = [];
    sidebar?.addEventListener('cetha:change', (event) => {
      (window as typeof window & { sidebarEvents: boolean[] }).sidebarEvents.push((event as CustomEvent<{ open: boolean }>).detail.open);
    });
  });
  await sidebarToggle.click();
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await expect(page.locator('[data-cetha-sidebar-backdrop]')).not.toHaveAttribute('hidden', '');
  } else {
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  }
  await page.keyboard.press('Escape');
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebarToggle).toBeFocused();
  await expect(page.locator('[data-cetha-sidebar-backdrop]')).toHaveAttribute('hidden', '');
  await expect(page.locator('[data-cetha-sidebar-backdrop]')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  expect(await page.evaluate(() => (window as typeof window & { sidebarEvents: boolean[] }).sidebarEvents)).toEqual([true, false]);
});

test('closes the sidebar with its built-in close action and returns focus', async ({ page }) => {
  const sidebarToggle = page.getByRole('button', { name: 'Toggle navigation' });
  await sidebarToggle.click();
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebarToggle).toBeFocused();
});

test('keeps scroll locked until the last overlay closes', async ({ page }, testInfo) => {
  const sidebarToggle = page.getByRole('button', { name: 'Toggle navigation' });
  await sidebarToggle.click();
  await page.evaluate(() => document.querySelector<HTMLElement>('[data-cetha-dialog-open="edit-dialog"]')?.click());
  const dialog = page.getByRole('dialog', { name: 'Edit workspace' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).not.toBeVisible();
  if (testInfo.project.name === 'mobile') await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  else await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('announces toast state after entering', async ({ page }) => {
  await page.getByRole('button', { name: 'Show toast' }).click();
  const toast = page.getByRole('status').filter({ hasText: 'Configuration saved' });
  await expect(toast).toBeVisible();
  await expect(toast).toHaveCSS('opacity', '1');
  await expect(toast).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('uses compact control density and switches the scoped color mode', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Small' })).toHaveCSS('height', '32px');
  await expect(page.getByRole('button', { name: 'Default' })).toHaveCSS('height', '36px');
  await expect(page.getByRole('button', { name: 'Large' })).toHaveCSS('height', '40px');
  await expect(page.getByLabel('Small input')).toHaveCSS('height', '32px');
  await expect(page.getByLabel('Default input')).toHaveCSS('height', '36px');
  await expect(page.getByLabel('Large input')).toHaveCSS('height', '40px');
  await expect(page.getByRole('button', { name: 'Small' })).toHaveCSS('border-radius', '4px');
  await expect(page.getByLabel('Small input')).toHaveCSS('border-radius', '4px');

  const loading = page.getByRole('button', { name: 'Saving' });
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveCSS('cursor', 'wait');
  await expect(loading).toHaveCSS('pointer-events', 'auto');
  await expect(loading).toHaveCSS('transform', 'none');

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

test('aligns alert icons with their titles', async ({ page }) => {
  const alert = page.getByRole('status').filter({ hasText: 'Configuration required' });
  const iconBox = await alert.locator('svg').boundingBox();
  const titleBox = await alert.locator('p').boundingBox();
  expect(iconBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect(Math.abs((iconBox?.y ?? 0) - (titleBox?.y ?? 0))).toBeLessThanOrEqual(2);
});

test('matches the component catalogue visual baseline', async ({ page }, testInfo) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot(`catalogue-${testInfo.project.name}.png`, {
    fullPage: true,
    animations: 'disabled',
  });
});
