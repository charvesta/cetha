const boundSidebars = new WeakSet<HTMLElement>();
const boundToggles = new WeakSet<HTMLElement>();
const lastTriggers = new WeakMap<HTMLElement, HTMLElement>();
let resizeBound = false;

function isCollapsedAtCurrentViewport(sidebar: HTMLElement): boolean {
  if (typeof window === 'undefined') return false;
  const desktop = window.matchMedia('(min-width: 768px)').matches;
  const mode = sidebar.dataset.collapsible ?? 'mobile';
  return mode === 'all' || (mode === 'desktop' ? desktop : !desktop);
}

function syncBodyScrollLock(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const shouldLock = mobile && Array.from(document.querySelectorAll<HTMLElement>('[data-cetha-sidebar][data-open="true"]'))
    .some((sidebar) => ['mobile', 'all'].includes(sidebar.dataset.collapsible ?? 'mobile'));
  document.body.classList.toggle('cetha-sidebar-scroll-locked', shouldLock);
}

function syncSidebarState(sidebar: HTMLElement): void {
  const open = sidebar.dataset.open === 'true';
  const collapsed = isCollapsedAtCurrentViewport(sidebar);
  const backdrop = sidebar.querySelector<HTMLButtonElement>('[data-cetha-sidebar-backdrop]');
  const panel = sidebar.querySelector<HTMLElement>('[data-cetha-sidebar-panel]');
  if (backdrop) backdrop.hidden = !(open && collapsed && window.matchMedia('(max-width: 767px)').matches);
  if (panel) panel.inert = collapsed && !open;
}

function setOpen(
  sidebar: HTMLElement,
  open: boolean,
  options: { focusPanel?: boolean; returnFocus?: boolean; trigger?: HTMLElement } = {},
): void {
  const changed = sidebar.dataset.open !== String(open);
  if (open && options.trigger) lastTriggers.set(sidebar, options.trigger);
  sidebar.dataset.open = String(open);
  const id = sidebar.id;
  if (id && typeof document !== 'undefined') {
    document.querySelectorAll<HTMLElement>(`[data-cetha-sidebar-toggle="${CSS.escape(id)}"]`).forEach((toggle) => {
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  syncSidebarState(sidebar);
  syncBodyScrollLock();
  if (open && options.focusPanel) sidebar.querySelector<HTMLElement>('[data-cetha-sidebar-panel] a, [data-cetha-sidebar-panel] button')?.focus();
  if (!open && options.returnFocus) lastTriggers.get(sidebar)?.focus();
  if (changed) sidebar.dispatchEvent(new CustomEvent('cetha:change', { bubbles: true, detail: { open } }));
}

export function initSidebars(root?: ParentNode): void {
  const scope = root ?? (typeof document === 'undefined' ? undefined : document);
  if (!scope) return;

  scope.querySelectorAll<HTMLElement>('[data-cetha-sidebar]').forEach((sidebar) => {
    if (!boundSidebars.has(sidebar)) {
      sidebar.dataset.cethaEnhanced = 'true';
      sidebar.querySelector<HTMLElement>('[data-cetha-sidebar-backdrop]')?.addEventListener('click', () => setOpen(sidebar, false, { returnFocus: true }));
      sidebar.querySelector<HTMLElement>('[data-cetha-sidebar-close]')?.addEventListener('click', () => setOpen(sidebar, false, { returnFocus: true }));
      sidebar.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.dataset.open === 'true') {
          event.preventDefault();
          setOpen(sidebar, false, { returnFocus: true });
        }
      });
      syncSidebarState(sidebar);
      boundSidebars.add(sidebar);
    }

    if (!sidebar.id) return;
    document.querySelectorAll<HTMLElement>(`[data-cetha-sidebar-toggle="${CSS.escape(sidebar.id)}"]`).forEach((toggle) => {
      if (boundToggles.has(toggle)) return;
      toggle.setAttribute('aria-controls', sidebar.id);
      toggle.setAttribute('aria-expanded', sidebar.dataset.open ?? 'false');
      toggle.addEventListener('click', () => {
        const open = sidebar.dataset.open !== 'true';
        setOpen(sidebar, open, { focusPanel: open, returnFocus: !open, trigger: toggle });
      });
      boundToggles.add(toggle);
    });
  });

  syncBodyScrollLock();
  if (!resizeBound && typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      document.querySelectorAll<HTMLElement>('[data-cetha-sidebar]').forEach(syncSidebarState);
      syncBodyScrollLock();
    });
    resizeBound = true;
  }
}
