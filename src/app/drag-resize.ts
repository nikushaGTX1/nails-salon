/** Shared drag-to-move + drag-to-resize handles, used by any editable element (whole card blocks
 *  and individual text/fields alike). Move/resize are stored as vw/vh (viewport-relative) rather
 *  than fixed px, so a position/size set on one screen scales proportionally on another instead
 *  of staying a fixed pixel offset — not full breakpoint-perfect responsiveness, but it holds up
 *  much better across screen widths than a raw px offset would. Persists via the CMS settings
 *  map, keyed by `editKey`, under `block:<key>:pos` / `block:<key>:w` / `:h`.
 *
 *  While dragging, the element snaps to the edges/centers of other editable elements on the
 *  page (within a few pixels) and shows a thin guide line, the way a design tool aligns layers. */

const SNAP_PX = 6;

let vGuide: HTMLDivElement | null = null;
let hGuide: HTMLDivElement | null = null;

function ensureGuides(): void {
  if (!vGuide) {
    vGuide = document.createElement('div');
    vGuide.className = 'snap-guide snap-guide-v';
    document.body.appendChild(vGuide);
  }
  if (!hGuide) {
    hGuide = document.createElement('div');
    hGuide.className = 'snap-guide snap-guide-h';
    document.body.appendChild(hGuide);
  }
}
function showVGuide(x: number): void {
  ensureGuides();
  vGuide!.style.left = `${x}px`;
  vGuide!.style.display = 'block';
}
function showHGuide(y: number): void {
  ensureGuides();
  hGuide!.style.top = `${y}px`;
  hGuide!.style.display = 'block';
}
function hideGuides(): void {
  if (vGuide) vGuide.style.display = 'none';
  if (hGuide) hGuide.style.display = 'none';
}

function collectSnapTargets(exclude: HTMLElement): { xs: number[]; ys: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  document.querySelectorAll<HTMLElement>('.is-editable-block, .is-editable').forEach((el) => {
    if (el === exclude || exclude.contains(el) || el.contains(exclude)) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    xs.push(r.left, r.left + r.width / 2, r.right);
    ys.push(r.top, r.top + r.height / 2, r.bottom);
  });
  return { xs, ys };
}

function nearestSnap(values: number[], targets: number[]): { value: number; delta: number } | null {
  for (const v of values) {
    for (const t of targets) {
      if (Math.abs(v - t) <= SNAP_PX) return { value: t, delta: t - v };
    }
  }
  return null;
}

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
  let posVwX = 0;
  let posVhY = 0;
  let sizeVw = 0;
  let sizeVh = 0;
  let dragHandle: HTMLDivElement | null = null;
  let resizeHandle: HTMLDivElement | null = null;

  function load(): void {
    if (!editKey) return;
    const pos = getSetting('block:' + editKey + ':pos', '');
    if (pos) {
      const [x, y] = pos.split(',').map(Number);
      posVwX = x || 0;
      posVhY = y || 0;
      hostEl.style.transform = `translate(${posVwX}vw, ${posVhY}vh)`;
    }
    const w = getSetting('block:' + editKey + ':w', '');
    const h = getSetting('block:' + editKey + ':h', '');
    if (w) {
      sizeVw = Number(w) || 0;
      hostEl.style.width = sizeVw + 'vw';
    }
    if (h) {
      sizeVh = Number(h) || 0;
      hostEl.style.height = sizeVh + 'vh';
    }
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
      dragHandle.contentEditable = 'false';
      dragHandle.setAttribute('aria-hidden', 'true');
      dragHandle.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="pointer-events:none"><circle cx="3" cy="3" r="1.3"/><circle cx="9" cy="3" r="1.3"/><circle cx="3" cy="9" r="1.3"/><circle cx="9" cy="9" r="1.3"/></svg>';
      dragHandle.addEventListener('pointerdown', beginDrag);
      hostEl.appendChild(dragHandle);
    }
    if (!resizeHandle) {
      resizeHandle = document.createElement('div');
      resizeHandle.className = 'block-resize-handle';
      resizeHandle.contentEditable = 'false';
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
    const originPxX = (posVwX / 100) * window.innerWidth;
    const originPxY = (posVhY / 100) * window.innerHeight;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    let lastPxX = originPxX;
    let lastPxY = originPxY;

    const move = (e: PointerEvent) => {
      let pxX = originPxX + (e.clientX - startClientX);
      let pxY = originPxY + (e.clientY - startClientY);
      hostEl.style.transform = `translate(${pxX}px, ${pxY}px)`;

      const rect = hostEl.getBoundingClientRect();
      const targets = collectSnapTargets(hostEl);
      const snapX = nearestSnap([rect.left, rect.left + rect.width / 2, rect.right], targets.xs);
      const snapY = nearestSnap([rect.top, rect.top + rect.height / 2, rect.bottom], targets.ys);
      if (snapX) {
        pxX += snapX.delta;
        showVGuide(snapX.value);
      } else if (vGuide) {
        vGuide.style.display = 'none';
      }
      if (snapY) {
        pxY += snapY.delta;
        showHGuide(snapY.value);
      } else if (hGuide) {
        hGuide.style.display = 'none';
      }
      hostEl.style.transform = `translate(${pxX}px, ${pxY}px)`;
      lastPxX = pxX;
      lastPxY = pxY;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      hideGuides();
      posVwX = (lastPxX / window.innerWidth) * 100;
      posVhY = (lastPxY / window.innerHeight) * 100;
      hostEl.style.transform = `translate(${posVwX}vw, ${posVhY}vh)`;
      setSetting('block:' + editKey + ':pos', `${posVwX.toFixed(2)},${posVhY.toFixed(2)}`);
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
    let lastW = originW;
    let lastH = originH;

    const move = (e: PointerEvent) => {
      lastW = Math.max(40, originW + (e.clientX - startClientX));
      lastH = Math.max(24, originH + (e.clientY - startClientY));
      hostEl.style.width = lastW + 'px';
      hostEl.style.height = lastH + 'px';
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      sizeVw = (lastW / window.innerWidth) * 100;
      sizeVh = (lastH / window.innerHeight) * 100;
      hostEl.style.width = sizeVw + 'vw';
      hostEl.style.height = sizeVh + 'vh';
      setSetting('block:' + editKey + ':w', sizeVw.toFixed(2));
      setSetting('block:' + editKey + ':h', sizeVh.toFixed(2));
      markDirty();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return { load, setActive, beginDrag, destroy: removeHandles };
}
