import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({
  selector: 'app-category-grid',
  standalone: false,
  templateUrl: './category-grid.html',
})
export class CategoryGrid {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
}
