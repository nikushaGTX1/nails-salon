import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
@Component({ selector: 'app-booking', standalone: false, templateUrl: './booking.html' })
export class Booking {
  constructor(readonly i18n: TranslationService, readonly site: SiteContentService) {}
  bookingSent = false;
  submit(event: Event): void {
    event.preventDefault();
    this.bookingSent = true;
  }
}
