import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { CmsCategory, SiteContentService } from '../site-content.service';
import { EditModeService } from '../edit-mode.service';

@Component({
  selector: 'app-category-grid',
  standalone: false,
  templateUrl: './category-grid.html',
})
export class CategoryGrid {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
    readonly editMode: EditModeService,
  ) {}

  fieldSetter(target: Record<string, string>, lang: string): (value: string) => void {
    return (value: string) => {
      target[lang] = value;
    };
  }

  imageSetter(category: CmsCategory): (url: string) => void {
    return (url: string) => {
      category.imageUrl = url;
    };
  }
}
