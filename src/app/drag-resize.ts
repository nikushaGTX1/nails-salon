/** Shared drag-to-move + drag-to-resize handles, used by any editable element (whole card blocks
 *  and individual text/fields alike). Move/resize are stored as vw/vh (viewport-relative) rather
 *  than fixed px, so a position/size set on one screen scales proportionally on another instead
 *  of staying a fixed pixel offset. They only ever apply above the site's mobile breakpoint
 *  (800px) — on a phone, everything renders in its original, unmoved responsive layout, so a
 *  desktop-only drag/resize can never look broken on a visitor's phone.
 *
 *  While dragging, the element snaps to the edges/centers of other editable elements on the
 *  page (within a few pixels) and shows a thin guide line, the way a design tool aligns layers.
 *
 *  `measureContent: true` (used for individual text/fields) positions the handles AND the
 *  selection outline against the element's actual rendered TEXT bounds rather than its CSS box —
 *  a `<p>`/`<h2>` is block-level and its box can stretch far wider than the visible words (e.g.
 *  inside a wide grid column), so anchoring anything to the box's own edge would put it nowhere
 *  near what's on screen. The native `.is-editable` CSS outline (which *does* follow that
 *  stretched box) is suppressed in favor of a custom outline drawn from the same measurement, so
 *  the outline and the handles always agree on what "the text" actually is. For multi-line text,
 *  the drag handle anchors to the first line and the resize handle to the last line — both
 *  stable, predictable corners — while the outline itself wraps the full multi-line union.
 *  Whole card blocks (`measureContent: false`) anchor everything to the box itself, which for a
 *  card IS the visible thing. */

const MOBILE_BREAKPOINT = 800;
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

function textClientRects(hostEl: HTMLElement): DOMRectList | null {
  try {
    const range = document.createRange();
    range.selectNodeContents(hostEl);
    const rects = range.getClientRects();
    return rects.length > 0 ? rects : null;
  } catch {
    return null;
  }
}

export function attachDragResizeHandles(
  hostEl: HTMLElement,
  editKey: string,
  getSetting: (key: string, fallback: string) => string,
  setSetting: (key: string, value: string) => void,
  markDirty: () => void,
  measureContent = false,
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
  let outlineBox: HTMLDivElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let syncTimer: ReturnType<typeof setInterval> | null = null;

  /** Box that visually wraps ALL rendered lines — used for the outline and for snap targets. */
  function unionRect(): DOMRect {
    if (measureContent) {
      const rects = textClientRects(hostEl);
      if (rects) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        for (const r of Array.from(rects)) {
          left = Math.min(left, r.left);
          top = Math.min(top, r.top);
          right = Math.max(right, r.right);
          bottom = Math.max(bottom, r.bottom);
        }
        if (Number.isFinite(left)) {
          return { left, top, right, bottom, width: right - left, height: bottom - top } as DOMRect;
        }
      }
    }
    return hostEl.getBoundingClientRect();
  }

  /** Stable anchor points: first line for the drag handle, last line for resize — the union
   *  rect's own corners aren't reliable anchors once a paragraph wraps across very differently
   *  sized lines. */
  function firstLineRect(): DOMRect {
    if (measureContent) {
      const rects = textClientRects(hostEl);
      if (rects) return rects[0];
    }
    return hostEl.getBoundingClientRect();
  }
  function lastLineRect(): DOMRect {
    if (measureContent) {
      const rects = textClientRects(hostEl);
      if (rects) return rects[rects.length - 1];
    }
    return hostEl.getBoundingClientRect();
  }

  function load(): void {
    if (!editKey || window.innerWidth <= MOBILE_BREAKPOINT) return;
    const pos = getSetting('block:' + editKey + ':pos', '');
    if (pos) {
      // A CSS entrance animation with fill-mode "both"/"forwards" keeps overriding this
      // element's `transform` forever (animations beat even inline !important in the
      // cascade), so our own offset would silently never render. Turn it off once we're
      // actually placing a custom offset.
      hostEl.style.animation = 'none';
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
    if (!measureContent && getComputedStyle(hostEl).position === 'static') {
      hostEl.style.position = 'relative';
    }
  }

  function positionFixedHandles(): void {
    if (!measureContent) return;
    const first = firstLineRect();
    const last = lastLineRect();
    if (dragHandle) {
      dragHandle.style.left = `${first.right - 4}px`;
      dragHandle.style.top = `${first.top - 26}px`;
    }
    if (resizeHandle) {
      resizeHandle.style.left = `${last.right - 4}px`;
      resizeHandle.style.top = `${last.bottom - 4}px`;
    }
    if (outlineBox) {
      const u = unionRect();
      outlineBox.style.left = `${u.left - 4}px`;
      outlineBox.style.top = `${u.top - 2}px`;
      outlineBox.style.width = `${u.width + 8}px`;
      outlineBox.style.height = `${u.height + 4}px`;
    }
  }

  function ensureHandles(): void {
    if (!editKey) return;
    ensureRelative();
    hostEl.style.animation = 'none';
    if (!dragHandle) {
      dragHandle = document.createElement('div');
      dragHandle.className = measureContent ? 'block-drag-handle block-drag-handle--fixed' : 'block-drag-handle';
      dragHandle.contentEditable = 'false';
      dragHandle.setAttribute('aria-hidden', 'true');
      dragHandle.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="pointer-events:none"><circle cx="3" cy="3" r="1.3"/><circle cx="9" cy="3" r="1.3"/><circle cx="3" cy="9" r="1.3"/><circle cx="9" cy="9" r="1.3"/></svg>';
      dragHandle.addEventListener('pointerdown', beginDrag);
      (measureContent ? document.body : hostEl).appendChild(dragHandle);
    }
    if (!resizeHandle) {
      resizeHandle = document.createElement('div');
      resizeHandle.className = measureContent
        ? 'block-resize-handle block-resize-handle--fixed'
        : 'block-resize-handle';
      resizeHandle.contentEditable = 'false';
      resizeHandle.setAttribute('aria-hidden', 'true');
      resizeHandle.addEventListener('pointerdown', startResize);
      (measureContent ? document.body : hostEl).appendChild(resizeHandle);
    }
    if (measureContent) {
      hostEl.classList.add('has-precise-outline');
      if (!outlineBox) {
        outlineBox = document.createElement('div');
        outlineBox.className = 'text-outline-box';
        outlineBox.setAttribute('aria-hidden', 'true');
        document.body.appendChild(outlineBox);
        hostEl.addEventListener('focus', () => outlineBox?.classList.add('is-focused'));
        hostEl.addEventListener('blur', () => outlineBox?.classList.remove('is-focused'));
      }
      positionFixedHandles();
      window.addEventListener('scroll', positionFixedHandles, true);
      window.addEventListener('resize', positionFixedHandles);
      resizeObserver = new ResizeObserver(positionFixedHandles);
      resizeObserver.observe(hostEl);
      // A layout shift caused by something ELSE on the page (e.g. a sibling growing taller)
      // moves this element without changing its own size, so the ResizeObserver above won't
      // fire — nothing short of polling reliably catches that.
      syncTimer = setInterval(positionFixedHandles, 200);
    }
  }

  function removeHandles(): void {
    dragHandle?.remove();
    dragHandle = null;
    resizeHandle?.remove();
    resizeHandle = null;
    outlineBox?.remove();
    outlineBox = null;
    hostEl.classList.remove('has-precise-outline');
    if (measureContent) {
      window.removeEventListener('scroll', positionFixedHandles, true);
      window.removeEventListener('resize', positionFixedHandles);
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (syncTimer) clearInterval(syncTimer);
      syncTimer = null;
    }
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
      positionFixedHandles();
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
      positionFixedHandles();
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
      positionFixedHandles();
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
      positionFixedHandles();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return { load, setActive, beginDrag, destroy: removeHandles };
}
