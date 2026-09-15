/** Small floating A-/A+ control shown above a text element while it's focused in edit mode.
 *  Adjusts font-size directly and hands the new px value back to the caller to persist. */
export function attachFontSizeToolbar(
  hostEl: HTMLElement,
  getSizePx: () => number,
  setSizePx: (px: number) => void,
): { destroy: () => void } {
  let bar: HTMLDivElement | null = null;

  function position(): void {
    if (!bar) return;
    const rect = hostEl.getBoundingClientRect();
    bar.style.left = `${Math.max(8, rect.left + window.scrollX)}px`;
    bar.style.top = `${Math.max(8, rect.top + window.scrollY - 38)}px`;
  }

  function adjust(delta: number): void {
    const next = Math.max(10, Math.min(160, Math.round(getSizePx() + delta)));
    setSizePx(next);
    position();
  }

  function show(): void {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'font-size-toolbar';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = 'A−';
    minus.addEventListener('mousedown', (e) => {
      e.preventDefault();
      adjust(-2);
    });
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = 'A+';
    plus.addEventListener('mousedown', (e) => {
      e.preventDefault();
      adjust(2);
    });
    bar.append(minus, plus);
    document.body.appendChild(bar);
    position();
  }

  function hide(): void {
    bar?.remove();
    bar = null;
  }

  hostEl.addEventListener('focus', show);
  hostEl.addEventListener('blur', hide);
  window.addEventListener('scroll', position, true);

  return {
    destroy: () => {
      hide();
      hostEl.removeEventListener('focus', show);
      hostEl.removeEventListener('blur', hide);
      window.removeEventListener('scroll', position, true);
    },
  };
}
