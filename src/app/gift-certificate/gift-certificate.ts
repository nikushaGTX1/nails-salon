import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({
  selector: 'app-gift-certificate',
  standalone: false,
  templateUrl: './gift-certificate.html',
})
export class GiftCertificate {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}

  get phoneHref(): string {
    return 'tel:' + this.site.phoneHref(this.site.primaryPhone());
  }

  get phoneDisplay(): string {
    return this.site.primaryPhone();
  }
}
