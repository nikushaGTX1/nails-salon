import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  effect,
  inject,
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
    effect(() => {
      if (!this.key) return;
      const storedPx = this.site.setting(this.styleKey, '');
      if (storedPx) this.el.nativeElement.style.fontSize = storedPx + 'px';
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
    if (this.key) {
      this.dragResize = attachDragResizeHandles(
        this.el.nativeElement,
        'text:' + this.key,
        (k, f) => this.site.setting(k, f),
        (k, v) => this.site.setSetting(k, v),
        () => this.editMode.dirty.set(true),
        true,
      );
      this.dragResize.load();
      this.dragResize.setActive(this.editMode.isEditing());
    }
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
