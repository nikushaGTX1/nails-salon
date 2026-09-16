import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { CmsService, SiteContentService } from '../site-content.service';
import { EditModeService } from '../edit-mode.service';

@Component({ selector: 'app-services', standalone: false, templateUrl: './services.html' })
export class Services {
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

  priceSetter(service: CmsService): (value: string) => void {
    return (value: string) => {
      const parsed = Number(value.replace(/[^\d.]/g, ''));
      if (!Number.isNaN(parsed)) service.price = parsed;
    };
  }
}
