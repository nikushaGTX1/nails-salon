import { Directive, ElementRef, HostListener, Input, effect, inject } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { EditModeService } from './edit-mode.service';
import { SiteContentService } from './site-content.service';

/** Applied to an element whose image/background comes from `site.media(key, fallback)`.
 *  In edit mode, clicking it opens a file picker and uploads the replacement straight to the CMS. */
@Directive({ selector: '[appEditableImage]', standalone: false })
export class EditableImage {
  @Input('appEditableImage') key = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly editMode = inject(EditModeService);
  private readonly site = inject(SiteContentService);
  private fileInput?: HTMLInputElement;

  constructor() {
    effect(() => {
      this.el.nativeElement.classList.toggle('is-editable-image', this.editMode.active());
    });
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (!this.editMode.active()) return;
    event.preventDefault();
    event.stopPropagation();
    this.pickFile();
  }

  private pickFile(): void {
    if (!this.fileInput) {
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.accept = 'image/*';
      this.fileInput.style.display = 'none';
      this.fileInput.addEventListener('change', () => this.upload());
      document.body.appendChild(this.fileInput);
    }
    this.fileInput.value = '';
    this.fileInput.click();
  }

  private upload(): void {
    const file = this.fileInput?.files?.[0];
    if (!file || !this.key) return;
    this.site.upload(file, this.editMode.token).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response && event.body) {
          this.site.setMedia(this.key, event.body.url);
          this.editMode.dirty.set(true);
        }
      },
    });
  }
}
