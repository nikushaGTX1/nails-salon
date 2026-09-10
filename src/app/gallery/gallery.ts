import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';

interface Work {
  key: string;
  category: string;
  position: string;
}

@Component({ selector: 'app-gallery', standalone: false, templateUrl: './gallery.html' })
export class Gallery {
  constructor(readonly i18n: TranslationService) {}
  readonly filters = ['all', 'manicure', 'pedicure', 'nailArt'];
  activeFilter = 'all';
  readonly works: Work[] = [
    { key: '1', category: 'manicure', position: '0% 0%' },
    { key: '2', category: 'manicure', position: '50% 0%' },
    { key: '3', category: 'pedicure', position: '100% 0%' },
    { key: '4', category: 'manicure', position: '0% 100%' },
    { key: '5', category: 'nailArt', position: '50% 100%' },
    { key: '6', category: 'pedicure', position: '100% 100%' },
  ];
  get filteredWorks(): Work[] {
    return this.activeFilter === 'all'
      ? this.works
      : this.works.filter((work) => work.category === this.activeFilter);
  }
}
