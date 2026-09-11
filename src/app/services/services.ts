import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({ selector: 'app-services', standalone: false, templateUrl: './services.html' })
export class Services {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
}
