const boundDialogs = new WeakSet<HTMLDialogElement>();
const boundTriggers = new WeakSet<HTMLElement>();
const previousFocus = new WeakMap<HTMLDialogElement, HTMLElement>();

function resolveDocument(root?: ParentNode): ParentNode | undefined {
  return root ?? (typeof document === 'undefined' ? undefined : document);
}

export function showDialog(id: string): boolean {
  if (typeof document === 'undefined') return false;
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement)) return false;
  const active = document.activeElement;
  if (active instanceof HTMLElement) previousFocus.set(dialog, active);
  if (!dialog.open) dialog.showModal();
  return true;
}

export function closeDialog(id: string, reason = ''): boolean {
  if (typeof document === 'undefined') return false;
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return false;
  dialog.close(reason);
  return true;
}

export function initDialogs(root?: ParentNode): void {
  const scope = resolveDocument(root);
  if (!scope) return;

  scope.querySelectorAll<HTMLElement>('[data-cetha-dialog-open]').forEach((trigger) => {
    if (boundTriggers.has(trigger)) return;
    trigger.addEventListener('click', () => {
      const id = trigger.dataset.cethaDialogOpen;
      if (id) showDialog(id);
    });
    boundTriggers.add(trigger);
  });

  scope.querySelectorAll<HTMLDialogElement>('dialog[data-cetha-dialog]').forEach((dialog) => {
    if (boundDialogs.has(dialog)) return;

    dialog.querySelectorAll<HTMLElement>('[data-cetha-dialog-close]').forEach((button) => {
      button.addEventListener('click', () => dialog.close(button.dataset.cethaDialogClose ?? 'dismiss'));
    });

    dialog.addEventListener('click', (event) => {
      if (dialog.dataset.closeOnBackdrop !== 'true' || event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!inside) dialog.close('backdrop');
    });

    dialog.addEventListener('close', () => {
      dialog.dispatchEvent(new CustomEvent('cetha:dialog-close', {
        bubbles: true,
        detail: { reason: dialog.returnValue },
      }));
      previousFocus.get(dialog)?.focus();
      previousFocus.delete(dialog);
    });
    boundDialogs.add(dialog);
  });
}
