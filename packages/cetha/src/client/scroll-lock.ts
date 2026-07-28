const owners = new Set<Element>();

function pruneDisconnectedOwners(): void {
  owners.forEach((owner) => {
    if (!owner.isConnected) owners.delete(owner);
  });
}

export function syncScrollLock(): void {
  if (typeof document === 'undefined') return;
  pruneDisconnectedOwners();
  document.body.classList.toggle('cetha-scroll-locked', owners.size > 0);
}

export function lockScroll(owner: Element): void {
  owners.add(owner);
  syncScrollLock();
}

export function unlockScroll(owner: Element): void {
  owners.delete(owner);
  syncScrollLock();
}
