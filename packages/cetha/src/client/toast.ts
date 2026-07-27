export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  message?: string;
  tone?: ToastTone;
  duration?: number;
  regionId?: string;
}

export function showToast(options: ToastOptions): boolean {
  if (typeof document === 'undefined') return false;
  const region = document.getElementById(options.regionId ?? 'cetha-toasts');
  if (!region) return false;

  const toast = document.createElement('div');
  toast.dataset.cethaToast = '';
  toast.dataset.tone = options.tone ?? 'neutral';
  toast.className = 'pointer-events-auto rounded-cetha-md border border-cetha-line bg-cetha-raised px-4 py-3 text-cetha-text shadow-cetha opacity-0 translate-y-2 transition-[opacity,transform]';
  toast.setAttribute('role', options.tone === 'danger' ? 'alert' : 'status');

  const title = document.createElement('p');
  title.className = 'text-sm font-medium text-cetha-text-strong';
  title.textContent = options.title;
  toast.append(title);
  if (options.message) {
    const message = document.createElement('p');
    message.className = 'mt-1 text-xs leading-5 text-cetha-text-subtle';
    message.textContent = options.message;
    toast.append(message);
  }

  region.append(toast);
  requestAnimationFrame(() => { toast.dataset.entering = 'true'; });
  window.setTimeout(() => {
    toast.dataset.entering = 'false';
    window.setTimeout(() => toast.remove(), 200);
  }, options.duration ?? 4000);
  return true;
}
