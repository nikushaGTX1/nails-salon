/** Shared drag-to-move + drag-to-resize handles, used by any editable element (whole card blocks
 *  and individual text/fields alike). Move is a CSS transform offset from the element's normal
 *  flow position (siblings never reflow); resize sets explicit width/height. Both persist via the
 *  CMS settings map, keyed by `editKey`, under `block:<key>:pos` / `block:<key>:w` / `:h`. */
export function attachDragResizeHandles(
  hostEl: HTMLElement,
  editKey: string,
  getSetting: (key: string, fallback: string) => string,
  setSetting: (key: string, value: string) => void,
  markDirty: () => void,
): {
  load: () => void;
  setActive: (active: boolean) => void;
  beginDrag: (event: PointerEvent) => void;
  destroy: () => void;
} {
  let posX = 0;
  let posY = 0;
  let dragHandle: HTMLDivElement | null = null;
  let resizeHandle: HTMLDivElement | null = null;

  function load(): void {
    if (!editKey) return;
    const pos = getSetting('block:' + editKey + ':pos', '');
    if (pos) {
      const [x, y] = pos.split(',').map(Number);
      posX = x || 0;
      posY = y || 0;
      hostEl.style.transform = `translate(${posX}px, ${posY}px)`;
    }
    const w = getSetting('block:' + editKey + ':w', '');
    const h = getSetting('block:' + editKey + ':h', '');
    if (w) hostEl.style.width = w + 'px';
    if (h) hostEl.style.height = h + 'px';
  }

  function ensureRelative(): void {
    if (getComputedStyle(hostEl).position === 'static') hostEl.style.position = 'relative';
  }

  function ensureHandles(): void {
    if (!editKey) return;
    ensureRelative();
    if (!dragHandle) {
      dragHandle = document.createElement('div');
      dragHandle.className = 'block-drag-handle';
      dragHandle.setAttribute('aria-hidden', 'true');
      dragHandle.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="pointer-events:none"><circle cx="3" cy="3" r="1.3"/><circle cx="9" cy="3" r="1.3"/><circle cx="3" cy="9" r="1.3"/><circle cx="9" cy="9" r="1.3"/></svg>';
      dragHandle.addEventListener('pointerdown', beginDrag);
      hostEl.appendChild(dragHandle);
    }
    if (!resizeHandle) {
      resizeHandle = document.createElement('div');
      resizeHandle.className = 'block-resize-handle';
      resizeHandle.setAttribute('aria-hidden', 'true');
      resizeHandle.addEventListener('pointerdown', startResize);
      hostEl.appendChild(resizeHandle);
    }
  }

  function removeHandles(): void {
    dragHandle?.remove();
    dragHandle = null;
    resizeHandle?.remove();
    resizeHandle = null;
  }

  function setActive(active: boolean): void {
    hostEl.classList.toggle('is-editable-block', active);
    if (active) ensureHandles();
    else removeHandles();
  }

  function beginDrag(event: PointerEvent): void {
    if (!editKey) return;
    event.preventDefault();
    event.stopPropagation();
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const originX = posX;
    const originY = posY;

    const move = (e: PointerEvent) => {
      posX = originX + (e.clientX - startClientX);
      posY = originY + (e.clientY - startClientY);
      hostEl.style.transform = `translate(${posX}px, ${posY}px)`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setSetting('block:' + editKey + ':pos', `${Math.round(posX)},${Math.round(posY)}`);
      markDirty();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function startResize(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const rect = hostEl.getBoundingClientRect();
    const originW = rect.width;
    const originH = rect.height;
    const startClientX = event.clientX;
    const startClientY = event.clientY;

    const move = (e: PointerEvent) => {
      const w = Math.max(40, Math.round(originW + (e.clientX - startClientX)));
      const h = Math.max(24, Math.round(originH + (e.clientY - startClientY)));
      hostEl.style.width = w + 'px';
      hostEl.style.height = h + 'px';
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const finalRect = hostEl.getBoundingClientRect();
      setSetting('block:' + editKey + ':w', String(Math.round(finalRect.width)));
      setSetting('block:' + editKey + ':h', String(Math.round(finalRect.height)));
      markDirty();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return { load, setActive, beginDrag, destroy: removeHandles };
}
