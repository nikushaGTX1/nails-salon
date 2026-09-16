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
import { TranslationService } from './translation.service';

/** Applied to an element already showing `{{ i18n.t('someKey') }}`. In edit mode it becomes
 *  directly editable in place; on blur the new text is written back to the CMS translations.
 *  Also carries a persisted font-size override (A-/A+ shown while focused) and its own
 *  drag-to-move / drag-to-resize handles, same as a whole card block. */
@Directive({ selector: '[appEditable]', standalone: false })
export class EditableText implements OnInit, OnDestroy {
  @Input('appEditable') key = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);
  private readonly i18n = inject(TranslationService);
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

  private get styleKey(): string {
    return 'style:text:' + this.key;
  }

  ngOnInit(): void {
    this.toolbar = attachFontSizeToolbar(
      this.el.nativeElement,
      () => this.editMode.isEditing(),
      () => parseFloat(getComputedStyle(this.el.nativeElement).fontSize) || 16,
      (px) => {
        this.el.nativeElement.style.fontSize = px + 'px';
        this.site.setSetting(this.styleKey, String(px));
        this.editMode.dirty.set(true);
      },
    );
    // Skip independent drag/resize for text that's already inside a draggable card block —
    // dragging the card AND its own heading both moving the whole thing was confusing (and a
    // stray click on the wrong one of two overlapping handles could move the card when only
    // the text inside it was meant to move). The card's own handle covers this; text here
    // keeps click-to-edit and its font-size control.
    const insideBlock = this.el.nativeElement.closest('.editable-block-root');
    if (this.key && !insideBlock) {
      this.dragResize = attachDragResizeHandles(
        this.el.nativeElement,
        'text:' + this.key,
        (k, f) => this.site.setting(k, f),
        (k, v) => this.site.setSetting(k, v),
        () => this.editMode.dirty.set(true),
        true,
      );
      this.dragResize.setActive(this.editMode.isEditing());
    }
    // site.content() (translations, media, settings...) loads asynchronously (an HTTP GET),
    // so reading it just once here — before the real data has arrived — would silently miss
    // it. Both reads live inside effects (created here, once `this.key` is actually set, so
    // Angular has a real signal to react to on the first run) so they re-apply once the data
    // shows up, and again after every later save.
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (!this.key) return;
        const storedPx = this.site.setting(this.styleKey, '');
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
    if (!this.editMode.isEditing() || !this.key) return;
    const value = this.el.nativeElement.innerText.trim();
    this.site.setTranslation(this.i18n.language(), this.key, value);
    this.editMode.dirty.set(true);
  }
}
