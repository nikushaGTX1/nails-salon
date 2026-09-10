import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({ selector: 'app-main', standalone: false, templateUrl: './main.html' })
export class Main {
  showFilm = false;
  constructor(readonly i18n: TranslationService, readonly site: SiteContentService) {}
}
