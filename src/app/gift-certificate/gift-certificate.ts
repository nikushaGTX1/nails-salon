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

  showPhone = false;
  copied = false;

  get phoneDisplay(): string {
    return this.site.primaryPhone();
  }

  reveal(): void {
    this.showPhone = true;
  }

  copyPhone(): void {
    navigator.clipboard?.writeText(this.phoneDisplay).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    });
  }
}
