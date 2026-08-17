const bound = new WeakSet<HTMLElement>();
export function initComboboxes(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-cetha-combobox]').forEach((box) => {
    if (bound.has(box)) return;
    const input = box.querySelector<HTMLInputElement>('[data-cetha-combobox-input]'); const list = box.querySelector<HTMLElement>('[data-cetha-combobox-list]'); const hidden = box.querySelector<HTMLInputElement>('[data-cetha-combobox-value]'); const empty = box.querySelector<HTMLElement>('[data-cetha-combobox-empty]');
    if (!input || !list) return;
    const options = () => [...list.querySelectorAll<HTMLButtonElement>('[data-cetha-combobox-option]:not([hidden]):not(:disabled)')];
    const open = () => { list.classList.remove('hidden'); empty?.classList.add('hidden'); input.setAttribute('aria-expanded', 'true'); };
    const close = () => { list.classList.add('hidden'); empty?.classList.add('hidden'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    const activate = (index: number) => options().forEach((option, i) => { option.setAttribute('aria-selected', String(i === index)); if (i === index) { option.id ||= `${input.id}-option-${i}`; input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); } });
    const choose = (option: HTMLButtonElement) => { input.value = option.dataset.label ?? option.dataset.value ?? ''; if (hidden) hidden.value = option.dataset.value ?? ''; box.dispatchEvent(new CustomEvent('cetha:change', { bubbles: true, detail: { value: option.dataset.value, label: input.value } })); close(); input.focus(); };
    input.addEventListener('focus', open); input.addEventListener('input', () => { const query = input.value.toLocaleLowerCase(); list.querySelectorAll<HTMLButtonElement>('[data-cetha-combobox-option]').forEach((option) => { option.hidden = !(option.dataset.label ?? option.textContent ?? '').toLocaleLowerCase().includes(query); }); open(); const visible = options(); empty?.classList.toggle('hidden', visible.length > 0); if (!visible.length) list.classList.add('hidden'); else activate(0); });
    input.addEventListener('keydown', (event) => { const visible = options(); const current = visible.findIndex((option) => option.id === input.getAttribute('aria-activedescendant')); if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); activate(event.key === 'ArrowDown' ? (current + 1) % visible.length : (current - 1 + visible.length) % visible.length); } else if (event.key === 'Enter' && current >= 0) { event.preventDefault(); choose(visible[current]!); } else if (event.key === 'Escape') close(); });
    list.addEventListener('click', (event) => { const option = (event.target as Element).closest<HTMLButtonElement>('[data-cetha-combobox-option]'); if (option && !option.disabled) choose(option); });
    box.ownerDocument.addEventListener('pointerdown', (event) => { if (!box.contains(event.target as Node)) close(); }); bound.add(box);
  });
}
