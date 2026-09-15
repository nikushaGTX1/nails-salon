import { Directive, ElementRef, HostListener, Input, OnInit, effect, inject } from '@angular/core';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';

/** Free drag-to-move and drag-to-resize for an entire block (a card, a hero text block, ...).
 *  Dragging happens through a small dedicated handle the directive adds to the block's corner —
 *  not "grab anywhere" — so it works reliably no matter what's inside the block (a link covering
 *  the whole card, editable text filling all the space, etc.). A second corner handle resizes.
 *  Move is a CSS transform offset from the element's normal flow position (siblings never
 *  reflow); resize sets explicit width/height. Both persist per `editKey` via the CMS settings
 *  map and apply on every load, admin or visitor.
 *
 *  Heads up: the offset/size are fixed pixels, not responsive — something moved/resized while
 *  looking at desktop can sit differently on a phone. Worth a check at a narrow width after use.
 *
 *  Any plain click on the block while editing is swallowed (so an admin dragging a card that's
 *  also a link, e.g. a category tile, never gets accidentally navigated away mid-edit). */
@Directive({ selector: '[appEditableBlock]', standalone: false })
export class EditableBlock implements OnInit {
  @Input('appEditableBlock') editKey = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);

  private posX = 0;
  private posY = 0;
  private dragHandle?: HTMLDivElement;
  private resizeHandle?: HTMLDivElement;

  constructor() {
    effect(() => {
      const active = this.editMode.isEditing();
      this.el.nativeElement.classList.toggle('is-editable-block', active);
      if (active) this.ensureHandles();
      else this.removeHandles();
    });
  }

  ngOnInit(): void {
    if (!this.editKey) return;
    const pos = this.site.setting('block:' + this.editKey + ':pos', '');
    if (pos) {
      const [x, y] = pos.split(',').map(Number);
      this.posX = x || 0;
      this.posY = y || 0;
      this.el.nativeElement.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
    }
    const w = this.site.setting('block:' + this.editKey + ':w', '');
    const h = this.site.setting('block:' + this.editKey + ':h', '');
    if (w) this.el.nativeElement.style.width = w + 'px';
    if (h) this.el.nativeElement.style.height = h + 'px';
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.editMode.isEditing()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  private ensureRelative(): void {
    if (getComputedStyle(this.el.nativeElement).position === 'static') {
      this.el.nativeElement.style.position = 'relative';
    }
  }

  private ensureHandles(): void {
    if (!this.editKey) return;
    this.ensureRelative();
    if (!this.dragHandle) {
      this.dragHandle = document.createElement('div');
      this.dragHandle.className = 'block-drag-handle';
      this.dragHandle.setAttribute('aria-hidden', 'true');
      this.dragHandle.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="3" cy="3" r="1.3"/><circle cx="9" cy="3" r="1.3"/><circle cx="3" cy="9" r="1.3"/><circle cx="9" cy="9" r="1.3"/></svg>';
      this.dragHandle.addEventListener('pointerdown', (e) => this.startDrag(e));
      this.el.nativeElement.appendChild(this.dragHandle);
    }
    if (!this.resizeHandle) {
      this.resizeHandle = document.createElement('div');
      this.resizeHandle.className = 'block-resize-handle';
      this.resizeHandle.setAttribute('aria-hidden', 'true');
      this.resizeHandle.addEventListener('pointerdown', (e) => this.startResize(e));
      this.el.nativeElement.appendChild(this.resizeHandle);
    }
  }

  private removeHandles(): void {
    this.dragHandle?.remove();
    this.dragHandle = undefined;
    this.resizeHandle?.remove();
    this.resizeHandle = undefined;
  }

  private startDrag(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const originX = this.posX;
    const originY = this.posY;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    const move = (e: PointerEvent) => {
      this.posX = originX + (e.clientX - startClientX);
      this.posY = originY + (e.clientY - startClientY);
      this.el.nativeElement.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.site.setSetting(
        'block:' + this.editKey + ':pos',
        `${Math.round(this.posX)},${Math.round(this.posY)}`,
      );
      this.editMode.dirty.set(true);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private startResize(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const rect = this.el.nativeElement.getBoundingClientRect();
    const originW = rect.width;
    const originH = rect.height;
    const startClientX = event.clientX;
    const startClientY = event.clientY;

    const move = (e: PointerEvent) => {
      const w = Math.max(60, Math.round(originW + (e.clientX - startClientX)));
      const h = Math.max(40, Math.round(originH + (e.clientY - startClientY)));
      this.el.nativeElement.style.width = w + 'px';
      this.el.nativeElement.style.height = h + 'px';
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const finalRect = this.el.nativeElement.getBoundingClientRect();
      this.site.setSetting('block:' + this.editKey + ':w', String(Math.round(finalRect.width)));
      this.site.setSetting('block:' + this.editKey + ':h', String(Math.round(finalRect.height)));
      this.editMode.dirty.set(true);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
}
