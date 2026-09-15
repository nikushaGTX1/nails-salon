import { Directive, ElementRef, HostListener, Input, OnInit, effect, inject } from '@angular/core';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';

/** Free drag-to-move and drag-to-resize for an entire block (a card, a hero text block, ...).
 *  Move is a CSS transform offset from the element's normal flow position (siblings never
 *  reflow); resize sets explicit width/height. Both persist per `editKey` via the CMS settings
 *  map and apply on every load, admin or visitor. This is the literal "drag things around,
 *  make them bigger/smaller" behavior — unlike the font-size/crop controls, it CAN look wrong
 *  on a different screen width than the one it was set on, since the offset/size are fixed
 *  pixels, not responsive. Preview at a few widths after using it. */
@Directive({ selector: '[appEditableBlock]', standalone: false })
export class EditableBlock implements OnInit {
  @Input('appEditableBlock') editKey = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);

  private dragging = false;
  private startClientX = 0;
  private startClientY = 0;
  private originX = 0;
  private originY = 0;
  private posX = 0;
  private posY = 0;
  private handle?: HTMLDivElement;

  constructor() {
    effect(() => {
      const active = this.editMode.isEditing();
      this.el.nativeElement.classList.toggle('is-editable-block', active);
      if (active) this.ensureHandle();
      else this.removeHandle();
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

  private ensureRelativeForHandle(): void {
    if (getComputedStyle(this.el.nativeElement).position === 'static') {
      this.el.nativeElement.style.position = 'relative';
    }
  }

  private ensureHandle(): void {
    if (this.handle || !this.editKey) return;
    this.ensureRelativeForHandle();
    this.handle = document.createElement('div');
    this.handle.className = 'block-resize-handle';
    this.handle.addEventListener('pointerdown', (e) => this.startResize(e));
    this.el.nativeElement.appendChild(this.handle);
  }

  private removeHandle(): void {
    this.handle?.remove();
    this.handle = undefined;
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.editMode.isEditing() || !this.editKey) return;
    const target = event.target as HTMLElement;
    // Let clicks on nested editable text/images/links/buttons behave normally instead of dragging.
    if (
      target !== this.el.nativeElement &&
      target.closest(
        '.is-editable, .is-editable-image, .block-resize-handle, button, a, input, textarea, [contenteditable="true"]',
      )
    ) {
      return;
    }
    event.preventDefault();
    this.dragging = true;
    this.startClientX = event.clientX;
    this.startClientY = event.clientY;
    this.originX = this.posX;
    this.originY = this.posY;
    this.el.nativeElement.setPointerCapture(event.pointerId);
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    event.preventDefault();
    this.posX = this.originX + (event.clientX - this.startClientX);
    this.posY = this.originY + (event.clientY - this.startClientY);
    this.el.nativeElement.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.nativeElement.releasePointerCapture(event.pointerId);
    this.site.setSetting('block:' + this.editKey + ':pos', `${Math.round(this.posX)},${Math.round(this.posY)}`);
    this.editMode.dirty.set(true);
  }

  private startResize(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const rect = this.el.nativeElement.getBoundingClientRect();
    const originW = rect.width;
    const originH = rect.height;
    const startX = event.clientX;
    const startY = event.clientY;
    let resizing = true;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    const move = (e: PointerEvent) => {
      if (!resizing) return;
      const w = Math.max(60, Math.round(originW + (e.clientX - startX)));
      const h = Math.max(40, Math.round(originH + (e.clientY - startY)));
      this.el.nativeElement.style.width = w + 'px';
      this.el.nativeElement.style.height = h + 'px';
    };
    const up = () => {
      resizing = false;
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
