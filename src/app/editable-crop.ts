import { Directive, ElementRef, HostListener, Input, OnInit, effect, inject } from '@angular/core';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';

/** Drag to pan, scroll/pinch to zoom — reframes a photo without ever changing its box size, so
 *  it's safe on the fluid grid (unlike free-form drag-move/resize, which would break responsive
 *  layout). Works on both an `<img>` (object-position + transform scale) and a background-image
 *  tile (background-position + background-size). Position/zoom persist via the CMS settings map,
 *  keyed by `editKey` (e.g. "gallery:<id>", "studio", "category:<id>") — self-contained, no
 *  per-template data field required. */
@Directive({ selector: '[appEditableCrop]', standalone: false })
export class EditableCrop implements OnInit {
  @Input('appEditableCrop') editKey = '';
  @Input() initialPosition = '50% 50%';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);
  private dragging = false;
  private zoom = 100;

  constructor() {
    effect(() => {
      this.el.nativeElement.classList.toggle('is-editable-crop', this.editMode.isEditing());
    });
  }

  ngOnInit(): void {
    if (!this.editKey) return;
    const storedPosition = this.site.setting('crop:' + this.editKey, '') || this.initialPosition;
    this.zoom = Number(this.site.setting('zoom:' + this.editKey, '100')) || 100;
    this.applyPosition(storedPosition);
    this.applyZoom();
  }

  private get isImg(): boolean {
    return this.el.nativeElement.tagName === 'IMG';
  }

  private applyPosition(position: string): void {
    if (this.isImg) {
      this.el.nativeElement.style.objectPosition = position;
      this.el.nativeElement.style.transformOrigin = position;
    } else {
      this.el.nativeElement.style.backgroundPosition = position;
    }
  }

  private applyZoom(): void {
    if (this.isImg) {
      this.el.nativeElement.style.transform = `scale(${this.zoom / 100})`;
    } else {
      // At 100% ("no zoom yet") defer to CSS `cover` so the tile fills its box correctly for any
      // photo's aspect ratio; only switch to an explicit percentage once the admin actually zooms.
      this.el.nativeElement.style.backgroundSize = this.zoom === 100 ? 'cover' : `${this.zoom}% auto`;
    }
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.editMode.isEditing() || !this.editKey) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
    this.el.nativeElement.setPointerCapture(event.pointerId);
    this.dragTo(event);
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    event.preventDefault();
    this.dragTo(event);
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.nativeElement.releasePointerCapture(event.pointerId);
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.editMode.isEditing() || !this.editKey) return;
    event.preventDefault();
    this.zoom = Math.max(100, Math.min(300, this.zoom - Math.sign(event.deltaY) * 8));
    this.applyZoom();
    this.site.setSetting('zoom:' + this.editKey, String(this.zoom));
    this.editMode.dirty.set(true);
  }

  private dragTo(event: PointerEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = Math.round((100 * (event.clientX - rect.left)) / rect.width);
    const y = Math.round((100 * (event.clientY - rect.top)) / rect.height);
    const position = `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
    this.applyPosition(position);
    this.site.setSetting('crop:' + this.editKey, position);
    this.editMode.dirty.set(true);
  }
}
