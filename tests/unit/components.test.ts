import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Button from '../../packages/cetha/src/components/Button.astro';
import Dialog from '../../packages/cetha/src/components/Dialog.astro';
import Field from '../../packages/cetha/src/components/Field.astro';
import Table from '../../packages/cetha/src/components/Table.astro';
import Tabs from '../../packages/cetha/src/components/Tabs.astro';
import Textarea from '../../packages/cetha/src/components/Textarea.astro';

describe('Cetha Astro components', () => {
  test('renders a native button with deterministic state', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { type: 'submit', variant: 'primary' },
      slots: { default: 'Save changes' },
    });

    expect(html).toContain('<button');
    expect(html).toContain('type="submit"');
    expect(html).toContain('Save changes');
    expect(html).not.toContain('client:');
  });

  test('connects field copy through stable caller-owned ids', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Field, {
      props: { id: 'company-name', label: 'Company name', description: 'Legal entity name', required: true },
      slots: { default: '<input id="company-name">' },
    });

    expect(html).toContain('for="company-name"');
    expect(html).toContain('id="company-name-description"');
    expect(html).toContain('Legal entity name');
  });

  test('renders a native dialog without opening it on the server', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Dialog, {
      props: { id: 'confirm-delete', title: 'Delete resource', description: 'This cannot be undone.', closeLabel: 'Close' },
      slots: { default: 'Confirmation content' },
    });

    expect(html).toContain('<dialog');
    expect(html).toContain('aria-labelledby="confirm-delete-title"');
    expect(html).not.toContain(' open>');
    expect(html).not.toContain(' open=""');
  });

  test('renders all tab content before progressive enhancement', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Tabs, {
      props: { id: 'settings', value: 'general', label: 'Settings' },
      slots: { default: '<section>General</section><section>Security</section>', list: '<button>General</button>' },
    });

    expect(html).toContain('General');
    expect(html).toContain('Security');
    expect(html).not.toContain(' hidden');
  });

  test('renders semantic table structure', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Table, {
      props: { caption: 'Deployments' },
      slots: { head: '<tr><th scope="col">Name</th></tr>', default: '<tr><td>Production</td></tr>' },
    });

    expect(html).toContain('<table');
    expect(html).toContain('<caption');
    expect(html).toContain('Deployments');
    expect(html).toContain('<tbody');
  });

  test('renders textarea values without leaking Astro slot markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Textarea, {
      props: { name: 'bio', value: 'Operational profile' },
    });

    expect(html).toContain('>Operational profile</textarea>');
    expect(html).not.toContain('&lt;slot /&gt;');
    expect(html).not.toContain('<slot />');
  });
});
