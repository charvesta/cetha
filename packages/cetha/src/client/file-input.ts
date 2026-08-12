export function initFileInputs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-cetha-file-input]').forEach((container) => {
    if (container.dataset.cethaEnhanced === 'true') return;
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    const output = container.querySelector<HTMLElement>('[data-cetha-file-name]');
    if (!input || !output) return;
    input.addEventListener('change', () => {
      const count = input.files?.length ?? 0;
      output.textContent = count > 1 ? `${count} file dipilih` : input.files?.[0]?.name ?? 'Pilih file';
    });
    container.dataset.cethaEnhanced = 'true';
  });
}
