const boundToggles = new WeakSet<HTMLButtonElement>();

export function initPasswordInputs(root?: ParentNode): void {
  const scope = root ?? (typeof document === 'undefined' ? undefined : document);
  if (!scope) return;

  scope.querySelectorAll<HTMLButtonElement>('[data-cetha-password-toggle]').forEach((toggle) => {
    if (boundToggles.has(toggle)) return;
    const container = toggle.closest<HTMLElement>('[data-cetha-password]');
    const input = container?.querySelector<HTMLInputElement>('input');
    if (!input) return;

    toggle.addEventListener('click', () => {
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      toggle.setAttribute('aria-label', reveal ? toggle.dataset.hideLabel ?? '' : toggle.dataset.showLabel ?? '');
      toggle.querySelector<HTMLElement>('[data-cetha-password-show]')?.toggleAttribute('hidden', reveal);
      toggle.querySelector<HTMLElement>('[data-cetha-password-hide]')?.toggleAttribute('hidden', !reveal);
    });
    boundToggles.add(toggle);
  });
}
