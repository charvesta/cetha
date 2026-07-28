const boundDropdowns = new WeakSet<HTMLDetailsElement>();
const outsidePointerDocuments = new WeakSet<Document>();

function menuItems(dropdown: HTMLDetailsElement): HTMLElement[] {
  return Array.from(dropdown.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter((item) => !item.hasAttribute('disabled'));
}

function resolveDocument(root?: ParentNode): Document | undefined {
  if (!root) return typeof document === 'undefined' ? undefined : document;
  if (root.nodeType === 9) return root as Document;
  return root.ownerDocument ?? undefined;
}

function bindOutsidePointerListener(ownerDocument: Document): void {
  if (outsidePointerDocuments.has(ownerDocument)) return;
  ownerDocument.addEventListener('pointerdown', (event) => {
    const target = event.target as Node | null;
    if (!target || typeof target.nodeType !== 'number') return;
    ownerDocument.querySelectorAll<HTMLDetailsElement>('details[data-cetha-dropdown][open]').forEach((dropdown) => {
      if (!dropdown.contains(target)) dropdown.open = false;
    });
  });
  outsidePointerDocuments.add(ownerDocument);
}

export function initDropdowns(root?: ParentNode): void {
  const ownerDocument = resolveDocument(root);
  const scope = root ?? ownerDocument;
  if (!scope || !ownerDocument) return;
  bindOutsidePointerListener(ownerDocument);

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
      const current = items.indexOf(dropdown.ownerDocument.activeElement as HTMLElement);
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

    boundDropdowns.add(dropdown);
  });
}
