import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({ selector: 'app-values', standalone: false, templateUrl: './values.html' })
export class Values {
  readonly cards = [
    { n: 1, image: '/assets/services/signature-manicure.png' },
    { n: 2, image: '/assets/hero.png' },
    { n: 3, image: '/assets/studio-interior.png' },
  ];
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
}
