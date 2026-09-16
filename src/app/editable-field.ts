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
import { attachFontSizeToolbar } from './font-size-toolbar';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';

/** Generic per-item editable field: the caller supplies a setter closure (works for any array
 *  item — a service's name, a category's label, a location's phone number, etc.) plus a stable
 *  `editStyleKey` (e.g. "service:<id>:name") so its font-size override and its own drag/resize
 *  handles persist across reloads. */
@Directive({ selector: '[appEditableField]', standalone: false })
export class EditableField implements OnInit, OnDestroy {
  @Input('appEditableField') handler: (value: string) => void = () => {};
  @Input() editStyleKey = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);
  private readonly injector = inject(Injector);
  private toolbar?: { destroy: () => void };
  private dragResize?: ReturnType<typeof attachDragResizeHandles>;

  constructor() {
    effect(() => {
      const active = this.editMode.isEditing();
      this.el.nativeElement.contentEditable = active ? 'true' : 'false';
      this.el.nativeElement.classList.toggle('is-editable', active);
      this.el.nativeElement.tabIndex = active ? 0 : -1;
      this.dragResize?.setActive(active);
    });
  }

  ngOnInit(): void {
    if (!this.editStyleKey) return;
    this.toolbar = attachFontSizeToolbar(
      this.el.nativeElement,
      () => this.editMode.isEditing(),
      () => parseFloat(getComputedStyle(this.el.nativeElement).fontSize) || 16,
      (px) => {
        this.el.nativeElement.style.fontSize = px + 'px';
        this.site.setSetting('style:' + this.editStyleKey, String(px));
        this.editMode.dirty.set(true);
      },
    );
    // Skip independent drag/resize for a field that's already inside a draggable card block —
    // see EditableText for why (the card's own handle covers repositioning it; this element
    // keeps click-to-edit and its font-size control).
    const insideBlock = this.el.nativeElement.closest('.editable-block-root');
    if (!insideBlock) {
      this.dragResize = attachDragResizeHandles(
        this.el.nativeElement,
        this.editStyleKey,
        (k, f) => this.site.setting(k, f),
        (k, v) => this.site.setSetting(k, v),
        () => this.editMode.dirty.set(true),
        true,
      );
      this.dragResize.setActive(this.editMode.isEditing());
    }
    // site.content() loads asynchronously (an HTTP GET), so reading it just once here —
    // before the real saved data has arrived — would silently miss it. Both reads live
    // inside effects (created here, once editStyleKey is actually set) so they re-apply
    // once the data shows up, and again after every later save.
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const storedPx = this.site.setting('style:' + this.editStyleKey, '');
        if (storedPx) this.el.nativeElement.style.fontSize = storedPx + 'px';
      });
      effect(() => this.dragResize?.load());
    });
  }

  ngOnDestroy(): void {
    this.toolbar?.destroy();
    this.dragResize?.destroy();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.editMode.isEditing()) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @HostListener('blur')
  onBlur(): void {
    if (!this.editMode.isEditing()) return;
    this.handler(this.el.nativeElement.innerText.trim());
    this.editMode.dirty.set(true);
  }
}
