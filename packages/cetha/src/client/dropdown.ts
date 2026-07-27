const boundDropdowns = new WeakSet<HTMLDetailsElement>();

function menuItems(dropdown: HTMLDetailsElement): HTMLElement[] {
  return Array.from(dropdown.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter((item) => !item.hasAttribute('disabled'));
}

export function initDropdowns(root?: ParentNode): void {
  const scope = root ?? (typeof document === 'undefined' ? undefined : document);
  if (!scope) return;

  scope.querySelectorAll<HTMLDetailsElement>('details[data-cetha-dropdown]').forEach((dropdown) => {
    if (boundDropdowns.has(dropdown)) return;
    const summary = dropdown.querySelector<HTMLElement>('summary');
    if (!summary) return;

    summary.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      dropdown.open = true;
      const items = menuItems(dropdown);
      (event.key === 'ArrowDown' ? items[0] : items.at(-1))?.focus();
    });

    dropdown.addEventListener('keydown', (event) => {
      const items = menuItems(dropdown);
      const current = items.indexOf(document.activeElement as HTMLElement);
      if (event.key === 'Escape') {
        event.preventDefault();
        dropdown.open = false;
        summary.focus();
      } else if (event.key === 'ArrowDown' && current >= 0) {
        event.preventDefault();
        items[(current + 1) % items.length]?.focus();
      } else if (event.key === 'ArrowUp' && current >= 0) {
        event.preventDefault();
        items[(current - 1 + items.length) % items.length]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        items.at(-1)?.focus();
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (dropdown.open && event.target instanceof Node && !dropdown.contains(event.target)) dropdown.open = false;
    });
    boundDropdowns.add(dropdown);
  });
}
