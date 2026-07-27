const boundTabs = new WeakSet<HTMLElement>();

function activate(root: HTMLElement, value: string, focus = false): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cetha-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-cetha-tab-panel]'));
  let changed = false;

  tabs.forEach((tab) => {
    const active = tab.dataset.value === value;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
    if (active) changed = true;
  });
  panels.forEach((panel) => panel.toggleAttribute('hidden', panel.dataset.value !== value));
  if (!changed) return;
  root.dataset.value = value;
  root.dispatchEvent(new CustomEvent('cetha:change', { bubbles: true, detail: { value } }));
}

export function initTabs(rootNode?: ParentNode): void {
  const scope = rootNode ?? (typeof document === 'undefined' ? undefined : document);
  if (!scope) return;

  scope.querySelectorAll<HTMLElement>('[data-cetha-tabs]').forEach((root) => {
    if (boundTabs.has(root)) return;
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cetha-tab]'));
    const initial = root.dataset.value ?? tabs[0]?.dataset.value;
    root.dataset.cethaEnhanced = 'true';
    if (initial) activate(root, initial);

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => tab.dataset.value && activate(root, tab.dataset.value));
      tab.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        const value = tabs[next]?.dataset.value;
        if (value) activate(root, value, true);
      });
    });
    boundTabs.add(root);
  });
}
