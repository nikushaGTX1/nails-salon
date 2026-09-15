import { Directive, ElementRef, HostListener, Input, effect, inject } from '@angular/core';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';
import { TranslationService } from './translation.service';

/** Applied to an element already showing `{{ i18n.t('someKey') }}`. In edit mode it becomes
 *  directly editable in place; on blur the new text is written back to the CMS translations. */
@Directive({ selector: '[appEditable]', standalone: false })
export class EditableText {
  @Input('appEditable') key = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);
  private readonly i18n = inject(TranslationService);

  constructor() {
    effect(() => {
      const active = this.editMode.active();
      this.el.nativeElement.contentEditable = active ? 'true' : 'false';
      this.el.nativeElement.classList.toggle('is-editable', active);
    });
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.editMode.active()) event.stopPropagation();
  }

  @HostListener('blur')
  onBlur(): void {
    if (!this.editMode.active() || !this.key) return;
    const value = this.el.nativeElement.innerText.trim();
    this.site.setTranslation(this.i18n.language(), this.key, value);
    this.editMode.dirty.set(true);
  }
}
