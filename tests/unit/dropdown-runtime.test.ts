import { describe, expect, test } from 'vitest';
import { initDropdowns } from '../../packages/cetha/src/client/dropdown';

type PointerListener = (event: { target: { nodeType: number } }) => void;

function createDocument() {
  const listeners: PointerListener[] = [];
  const dropdowns = [
    { open: true, contains: () => false },
    { open: true, contains: () => true },
  ];
  const ownerDocument = {
    nodeType: 9,
    ownerDocument: null,
    activeElement: null,
    addEventListener(type: string, listener: PointerListener) {
      if (type === 'pointerdown') listeners.push(listener);
    },
    querySelectorAll(selector: string) {
      return selector.includes('[open]') ? dropdowns.filter((dropdown) => dropdown.open) : [];
    },
  };
  return { ownerDocument: ownerDocument as unknown as Document, listeners, dropdowns };
}

describe('Dropdown runtime', () => {
  test('binds one delegated outside-click listener per document', () => {
    const first = createDocument();
    const second = createDocument();

    initDropdowns(first.ownerDocument);
    initDropdowns(first.ownerDocument);
    initDropdowns({
      nodeType: 1,
      ownerDocument: first.ownerDocument,
      querySelectorAll: () => [],
    } as unknown as ParentNode);
    initDropdowns(second.ownerDocument);

    expect(first.listeners).toHaveLength(1);
    expect(second.listeners).toHaveLength(1);

    first.listeners[0]?.({ target: { nodeType: 1 } });
    expect(first.dropdowns.map(({ open }) => open)).toEqual([false, true]);
    expect(second.dropdowns.map(({ open }) => open)).toEqual([true, true]);
  });
});
