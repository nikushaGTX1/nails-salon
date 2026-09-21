import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({ selector: 'app-four-hands', standalone: false, templateUrl: './four-hands.html' })
export class FourHands {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
}
