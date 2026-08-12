const boundDocuments = new WeakSet<Document>();

function resolveDocument(root?: ParentNode): Document | undefined {
  if (!root) return typeof document === 'undefined' ? undefined : document;
  if (root.nodeType === 9) return root as Document;
  return root.ownerDocument ?? undefined;
}

export function initPopovers(root?: ParentNode): void {
  const ownerDocument = resolveDocument(root);
  if (!ownerDocument || boundDocuments.has(ownerDocument)) return;
  ownerDocument.addEventListener('pointerdown', (event) => {
    const target = event.target as Node | null;
    if (!target) return;
    ownerDocument.querySelectorAll<HTMLDetailsElement>('details[data-cetha-popover][open]').forEach((popover) => {
      if (!popover.contains(target)) popover.open = false;
    });
  });
  ownerDocument.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const popover = ownerDocument.querySelector<HTMLDetailsElement>('details[data-cetha-popover][open]');
    if (!popover) return;
    popover.open = false;
    popover.querySelector<HTMLElement>('summary')?.focus();
  });
  boundDocuments.add(ownerDocument);
}
