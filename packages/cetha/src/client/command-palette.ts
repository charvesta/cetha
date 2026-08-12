export function initCommandPalettes(root: ParentNode = document): void {
  root.querySelectorAll<HTMLDialogElement>('[data-cetha-command-palette]').forEach((dialog) => {
    if (dialog.dataset.cethaEnhanced === 'true') return;
    const input = dialog.querySelector<HTMLInputElement>('[data-cetha-command-input]');
    const empty = dialog.querySelector<HTMLElement>('[data-cetha-command-empty]');
    const items = () => [...dialog.querySelectorAll<HTMLButtonElement>('[data-cetha-command-item]:not([hidden])')];
    const select = (index: number) => items().forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
    input?.addEventListener('input', () => { const q = input.value.trim().toLocaleLowerCase(); dialog.querySelectorAll<HTMLButtonElement>('[data-cetha-command-item]').forEach((item) => { item.hidden = !item.dataset.commandSearch?.toLocaleLowerCase().includes(q); }); const visible = items(); if (empty) empty.classList.toggle('hidden', visible.length > 0); select(0); });
    dialog.addEventListener('keydown', (event) => { const visible = items(); const current = visible.findIndex((item) => item.getAttribute('aria-selected') === 'true'); if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const next = event.key === 'ArrowDown' ? (current + 1) % visible.length : (current - 1 + visible.length) % visible.length; select(next); visible[next]?.scrollIntoView({ block: 'nearest' }); } if (event.key === 'Enter' && current >= 0) { event.preventDefault(); visible[current]?.click(); } });
    document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); dialog.showModal(); input?.focus(); select(0); } });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.dataset.cethaEnhanced = 'true';
  });
}
