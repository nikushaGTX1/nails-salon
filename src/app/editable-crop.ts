import { Directive, ElementRef, HostListener, Input, effect, inject } from '@angular/core';
import { EditModeService } from './edit-mode.service';

/** Drag-to-reposition the crop focal point of a background-image tile (e.g. a gallery photo).
 *  Only touches `background-position` — the tile's box size/layout never changes, so this is
 *  safe on the fluid grid (unlike free-form drag-move, which would break responsive layout). */
@Directive({ selector: '[appEditableCrop]', standalone: false })
export class EditableCrop {
  @Input('appEditableCrop') onReposition!: (position: string) => void;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private dragging = false;

  constructor() {
    effect(() => {
      this.el.nativeElement.classList.toggle('is-editable-crop', this.editMode.isEditing());
    });
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.editMode.isEditing()) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
    this.el.nativeElement.setPointerCapture(event.pointerId);
    this.applyFromPointer(event);
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    event.preventDefault();
    this.applyFromPointer(event);
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.nativeElement.releasePointerCapture(event.pointerId);
  }

  private applyFromPointer(event: PointerEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = Math.round((100 * (event.clientX - rect.left)) / rect.width);
    const y = Math.round((100 * (event.clientY - rect.top)) / rect.height);
    const position = `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
    this.el.nativeElement.style.backgroundPosition = position;
    this.onReposition(position);
  }
}
