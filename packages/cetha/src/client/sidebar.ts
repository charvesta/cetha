const boundSidebars = new WeakSet<HTMLElement>();
const boundToggles = new WeakSet<HTMLElement>();

function setOpen(sidebar: HTMLElement, open: boolean, focusPanel = false): void {
  sidebar.dataset.open = String(open);
  const id = sidebar.id;
  if (id && typeof document !== 'undefined') {
    document.querySelectorAll<HTMLElement>(`[data-cetha-sidebar-toggle="${CSS.escape(id)}"]`).forEach((toggle) => {
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  if (open && focusPanel) sidebar.querySelector<HTMLElement>('[data-cetha-sidebar-panel] a, [data-cetha-sidebar-panel] button')?.focus();
}

export function initSidebars(root?: ParentNode): void {
  const scope = root ?? (typeof document === 'undefined' ? undefined : document);
  if (!scope) return;

  scope.querySelectorAll<HTMLElement>('[data-cetha-sidebar]').forEach((sidebar) => {
    if (!boundSidebars.has(sidebar)) {
      sidebar.dataset.cethaEnhanced = 'true';
      sidebar.querySelector<HTMLElement>('[data-cetha-sidebar-backdrop]')?.addEventListener('click', () => setOpen(sidebar, false));
      sidebar.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.dataset.open === 'true') setOpen(sidebar, false);
      });
      boundSidebars.add(sidebar);
    }

    if (!sidebar.id) return;
    document.querySelectorAll<HTMLElement>(`[data-cetha-sidebar-toggle="${CSS.escape(sidebar.id)}"]`).forEach((toggle) => {
      if (boundToggles.has(toggle)) return;
      toggle.setAttribute('aria-controls', sidebar.id);
      toggle.setAttribute('aria-expanded', sidebar.dataset.open ?? 'false');
      toggle.addEventListener('click', () => setOpen(sidebar, sidebar.dataset.open !== 'true', true));
      boundToggles.add(toggle);
    });
  });
}
