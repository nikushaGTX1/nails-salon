import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
import { LOYALTY_RULES } from '../loyalty.service';

@Component({ selector: 'app-loyalty', standalone: false, templateUrl: './loyalty.html' })
export class Loyalty {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}

  /** Admin-editable via /admin → Business details (falls back to 3). */
  get standardRate(): number {
    return this.site.loyaltyStandardRate();
  }

  /** Admin-editable via /admin → Business details (falls back to 40). */
  get birthdayRate(): number {
    return this.site.loyaltyBirthdayRate();
  }

  /** Admin-editable example balance (falls back to 24.50). */
  get exampleBalanceAmount(): number {
    return this.site.loyaltyExampleBalance();
  }

  get currency(): string {
    return LOYALTY_RULES.currency;
  }
}
