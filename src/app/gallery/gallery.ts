import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { CmsGalleryItem, SiteContentService } from '../site-content.service';
import { EditModeService } from '../edit-mode.service';

@Component({ selector: 'app-gallery', standalone: false, templateUrl: './gallery.html' })
export class Gallery {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
    readonly editMode: EditModeService,
  ) {}
  readonly filters = ['all', 'manicure', 'pedicure', 'nailArt'];
  activeFilter = 'all';
  get filteredWorks() {
    const works = this.site.gallery();
    return this.activeFilter === 'all'
      ? works
      : works.filter((work) => work.category === this.activeFilter);
  }

  fieldSetter(target: Record<string, string>, lang: string): (value: string) => void {
    return (value: string) => {
      target[lang] = value;
    };
  }

  imageSetter(work: CmsGalleryItem): (url: string) => void {
    return (url: string) => {
      work.imageUrl = url;
    };
  }
}
