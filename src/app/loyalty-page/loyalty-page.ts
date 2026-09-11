import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
import { EXAMPLE_LOYALTY_TRANSACTIONS, LOYALTY_RULES } from '../loyalty.service';

@Component({
  selector: 'app-loyalty-page',
  standalone: false,
  templateUrl: './loyalty-page.html',
})
export class LoyaltyPage {
  readonly exampleTransactions = EXAMPLE_LOYALTY_TRANSACTIONS;
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}

  get exampleBalanceAmount(): number {
    return this.site.loyaltyExampleBalance();
  }

  get currency(): string {
    return LOYALTY_RULES.currency;
  }
}
