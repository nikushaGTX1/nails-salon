import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
@Component({ selector: 'app-booking', standalone: false, templateUrl: './booking.html' })
export class Booking {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
  bookingSent = false;
  bookingSending = false;
  bookingError = '';
  readonly minDate = new Date().toISOString().slice(0, 10);
  form = { name: '', phone: '', studio: '', service: '', date: '', time: '10:00' };
  submit(event: Event): void {
    event.preventDefault();
    if (this.bookingSending) return;
    this.bookingSending = true;
    this.bookingError = '';
    this.site.createBooking(this.form).subscribe({
      next: () => {
        this.bookingSending = false;
        this.bookingSent = true;
        this.form = { name: '', phone: '', studio: '', service: '', date: '', time: '10:00' };
      },
      error: (error) => {
        this.bookingSending = false;
        this.bookingError =
          error.error?.message || 'Your booking could not be sent. Please try again.';
      },
    });
  }
}
