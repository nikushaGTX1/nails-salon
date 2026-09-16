import {
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  effect,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { attachDragResizeHandles } from './drag-resize';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';

const DRAG_EXCLUDE =
  '.is-editable, .is-editable-image, .block-drag-handle, .block-resize-handle, button, a, input, textarea, [contenteditable="true"]';

/** Free drag-to-move and drag-to-resize for an entire block (a card, a hero text block, ...).
 *  Two ways to grab it: a dedicated handle in the corner (always present, works even if the
 *  block is otherwise covered edge-to-edge by a link or image), or clicking any blank area of
 *  the block directly — not its own editable text, links, buttons, or nested images.
 *
 *  Move is a CSS transform offset from the element's normal flow position (siblings never
 *  reflow); resize sets explicit width/height. Both persist per `editKey` and apply on every
 *  load. Heads up: the offset/size are fixed pixels, not responsive — something moved/resized
 *  on desktop can sit differently on a phone; worth a check at a narrow width after use.
 *
 *  Any plain click on the block while editing is swallowed so a draggable link (e.g. a category
 *  tile) never navigates away mid-edit. */
@Directive({ selector: '[appEditableBlock]', standalone: false })
export class EditableBlock implements OnInit, OnDestroy {
  @Input('appEditableBlock') editKey = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);
  private readonly injector = inject(Injector);
  private dragResize?: ReturnType<typeof attachDragResizeHandles>;

  constructor() {
    effect(() => this.dragResize?.setActive(this.editMode.isEditing()));
  }

  ngOnInit(): void {
    if (!this.editKey) return;
    // Marks this as a draggable unit so nested EditableText/EditableField instances (its own
    // heading, price, etc.) know to skip their own independent drag/resize — a permanent class,
    // not tied to active state, so it's there for `.closest()` lookups before editing even starts.
    this.el.nativeElement.classList.add('editable-block-root');
    this.dragResize = attachDragResizeHandles(
      this.el.nativeElement,
      this.editKey,
      (key, fallback) => this.site.setting(key, fallback),
      (key, value) => this.site.setSetting(key, value),
      () => this.editMode.dirty.set(true),
    );
    this.dragResize.setActive(this.editMode.isEditing());
    // site.content() loads asynchronously (an HTTP GET), so a plain one-shot load() call
    // can run before the real saved position has arrived. Reading it inside an effect
    // (created only once dragResize actually exists) makes it re-apply once the data shows
    // up, and again after every later save.
    runInInjectionContext(this.injector, () => effect(() => this.dragResize!.load()));
  }

  ngOnDestroy(): void {
    this.dragResize?.destroy();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.editMode.isEditing()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.editMode.isEditing() || !this.editKey) return;
    const target = event.target as HTMLElement;
    if (target !== this.el.nativeElement && target.closest(DRAG_EXCLUDE)) return;
    this.dragResize?.beginDrag(event);
  }
}
