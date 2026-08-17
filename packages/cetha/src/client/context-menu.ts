const bound = new WeakSet<HTMLElement>();
function items(menu: HTMLElement): HTMLElement[] { return [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')]; }
export function initContextMenus(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-cetha-context-menu]').forEach((container) => {
    if (bound.has(container)) return; const target = container.querySelector<HTMLElement>('[data-cetha-context-target]'); const menu = container.querySelector<HTMLElement>('[data-cetha-context-content]'); if (!target || !menu) return;
    const close = (focus = false) => { menu.classList.add('hidden'); if (focus) target.focus(); };
    if (target.tabIndex < 0) target.tabIndex = 0; target.setAttribute('aria-haspopup', 'menu');
    target.addEventListener('contextmenu', (event) => { event.preventDefault(); menu.style.left = `${Math.min(event.clientX, innerWidth - 208)}px`; menu.style.top = `${Math.min(event.clientY, innerHeight - 160)}px`; menu.classList.remove('hidden'); items(menu)[0]?.focus(); });
    target.addEventListener('keydown', (event) => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) { event.preventDefault(); const rect = target.getBoundingClientRect(); menu.style.left = `${rect.left}px`; menu.style.top = `${rect.bottom + 4}px`; menu.classList.remove('hidden'); items(menu)[0]?.focus(); } });
    menu.addEventListener('keydown', (event) => { const entries = items(menu); const current = entries.indexOf(container.ownerDocument.activeElement as HTMLElement); if (event.key === 'Escape') { event.preventDefault(); close(true); } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); entries[event.key === 'ArrowDown' ? (current + 1) % entries.length : (current - 1 + entries.length) % entries.length]?.focus(); } });
    menu.addEventListener('click', () => close()); container.ownerDocument.addEventListener('pointerdown', (event) => { if (!container.contains(event.target as Node)) close(); }); bound.add(container);
  });
}
