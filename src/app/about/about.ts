import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
@Component({ selector: 'app-about', standalone: false, templateUrl: './about.html' })
export class About {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
}
