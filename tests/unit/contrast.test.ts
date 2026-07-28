import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

const source = await readFile(new URL('../../packages/cetha/src/styles/source.css', import.meta.url), 'utf8');

function luminance(hex: string) {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function token(block: string, name: string) {
  const match = block.match(new RegExp(`--${name}:\\s*(#[a-f\\d]{6})`, 'i'));
  if (!match) throw new Error(`Missing ${name}`);
  return match[1];
}

describe('Cetha theme contrast', () => {
  test('keeps subtle dark-mode text above WCAG AA for normal text', () => {
    const dark = source.slice(source.indexOf('[data-cetha-mode="dark"]'));
    expect(contrast(token(dark, 'cetha-text-subtle'), token(dark, 'cetha-base'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token(dark, 'cetha-text'), token(dark, 'cetha-surface'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token(dark, 'cetha-brand-text'), token(dark, 'cetha-base'))).toBeGreaterThanOrEqual(4.5);
    for (const tone of ['success', 'warning', 'danger', 'info']) {
      expect(contrast(token(dark, `cetha-${tone}`), token(dark, `cetha-${tone}-soft`))).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('keeps light-mode body and subtle text above WCAG AA', () => {
    const light = source.slice(source.indexOf(':root'), source.indexOf('[data-cetha-mode="dark"]'));
    expect(contrast(token(light, 'cetha-text'), token(light, 'cetha-surface'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token(light, 'cetha-text-subtle'), token(light, 'cetha-base'))).toBeGreaterThanOrEqual(4.5);
  });
});
