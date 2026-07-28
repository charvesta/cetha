import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Button from '../../packages/cetha/src/components/Button.astro';
import Dialog from '../../packages/cetha/src/components/Dialog.astro';
import Field from '../../packages/cetha/src/components/Field.astro';
import Table from '../../packages/cetha/src/components/Table.astro';
import Tabs from '../../packages/cetha/src/components/Tabs.astro';
import Textarea from '../../packages/cetha/src/components/Textarea.astro';
import Input from '../../packages/cetha/src/components/Input.astro';
import PasswordInput from '../../packages/cetha/src/components/PasswordInput.astro';
import Select from '../../packages/cetha/src/components/Select.astro';
import Icon from '../../packages/cetha/src/components/Icon.astro';
import Alert from '../../packages/cetha/src/components/Alert.astro';
import Breadcrumbs from '../../packages/cetha/src/components/Breadcrumbs.astro';
import Tab from '../../packages/cetha/src/components/Tab.astro';
import Sidebar from '../../packages/cetha/src/components/Sidebar.astro';
import Dropdown from '../../packages/cetha/src/components/Dropdown.astro';
import Surface from '../../packages/cetha/src/components/Surface.astro';

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
    expect(html).toContain('[&amp;_td]:px-4');
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

  test.each([
    [Button, 'h-8', 'h-9', 'h-10'],
    [Input, 'h-8', 'h-9', 'h-10'],
    [Select, 'h-8', 'h-9', 'h-10'],
  ] as const)('renders deterministic sm, md, and lg control sizes', async (Component, smClass, mdClass, lgClass) => {
    const container = await AstroContainer.create();
    const small = await container.renderToString(Component, { props: { size: 'sm', 'aria-label': 'Small' }, slots: { default: 'Small' } });
    const medium = await container.renderToString(Component, { props: { 'aria-label': 'Default' }, slots: { default: 'Default' } });
    const large = await container.renderToString(Component, { props: { size: 'lg', 'aria-label': 'Large' }, slots: { default: 'Large' } });
    expect(small).toContain(smClass);
    expect(small).toContain('rounded-cetha-sm');
    expect(medium).toContain(mdClass);
    expect(medium).toContain('rounded-cetha-md');
    expect(large).toContain(lgClass);
    expect(large).toContain('rounded-cetha-md');
  });

  test('sizes password input without changing its stable relationships', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PasswordInput, {
      props: { id: 'secret', label: 'Secret', showLabel: 'Show', hideLabel: 'Hide', size: 'sm' },
    });
    expect(html).toContain('h-8');
    expect(html).toContain('rounded-cetha-sm');
    expect(html).toContain('for="secret"');
    expect(html).toContain('data-cetha-password');
  });

  test('uses a compact radius for small textarea controls', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Textarea, { props: { size: 'sm', 'aria-label': 'Notes' } });
    expect(html).toContain('rounded-cetha-sm');
  });

  test('maps elevation levels to component roles while keeping the legacy alias', async () => {
    const container = await AstroContainer.create();
    const surface = await container.renderToString(Surface, { props: { level: 'raised' }, slots: { default: 'Surface' } });
    const dropdown = await container.renderToString(Dropdown, { props: { id: 'actions' }, slots: { trigger: 'Actions', default: 'Menu' } });
    const dialog = await container.renderToString(Dialog, { props: { id: 'edit', title: 'Edit', closeLabel: 'Close' } });
    expect(surface).toContain('shadow-cetha-sm');
    expect(dropdown).toContain('shadow-cetha-md');
    expect(dialog).toContain('shadow-cetha-lg');
  });

  test('renders loading buttons with wait feedback and no press interaction', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, { props: { loading: true }, slots: { default: 'Saving' } });
    expect(html).toContain('cursor-wait');
    expect(html).not.toContain('pointer-events-none');
    expect(html).toContain('active:translate-y-0');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(' disabled');
  });

  test('renders local Phosphor geometry without a client runtime', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Icon, { props: { name: 'search', label: 'Search', size: 18 } });
    expect(html).toContain('viewBox="0 0 256 256"');
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('aria-label="Search"');
    expect(html).not.toContain('<script');
  });

  test('resets alert title margins so it aligns with the status icon', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Alert, {
      props: { tone: 'info', title: 'Configuration required' },
      slots: { default: 'Connect a destination.' },
    });
    expect(html).toContain('m-0 font-medium leading-5');
    expect(html).toContain('Configuration required');
  });

  test('resets native ordered-list markers in breadcrumbs', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumbs, {
      props: { label: 'Breadcrumb' },
      slots: { default: '<li>Home</li><li>Components</li>' },
    });
    expect(html).toContain('list-none');
    expect(html).toContain('m-0');
    expect(html).toContain('p-0');
  });

  test('styles tabs from aria-selected so enhancement can move active state', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Tab, {
      props: { tabsId: 'settings', value: 'security' },
      slots: { default: 'Security' },
    });
    expect(html).toContain('aria-selected:border-cetha-brand');
    expect(html).toContain('aria-selected:text-cetha-brand-text');
  });

  test('renders configurable sidebar geometry and an optional native close action', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sidebar, {
      props: {
        id: 'audit-sidebar',
        label: 'Audit navigation',
        closeLabel: 'Close navigation',
        collapsible: 'all',
        width: 'lg',
        side: 'right',
      },
      slots: { header: 'Audit', default: '<a href="/events">Events</a>' },
    });
    expect(html).toContain('data-collapsible="all"');
    expect(html).toContain('data-side="right"');
    expect(html).toContain('data-width="lg"');
    expect(html).toContain('w-80');
    expect(html).toContain('right-0');
    expect(html).toContain('data-cetha-sidebar-close');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain(' hidden');
  });
});
