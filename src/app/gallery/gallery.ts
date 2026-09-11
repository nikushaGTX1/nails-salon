import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({ selector: 'app-gallery', standalone: false, templateUrl: './gallery.html' })
export class Gallery {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
  readonly filters = ['all', 'manicure', 'pedicure', 'nailArt'];
  activeFilter = 'all';
  get filteredWorks() {
    const works = this.site.gallery();
    return this.activeFilter === 'all'
      ? works
      : works.filter((work) => work.category === this.activeFilter);
  }
}
