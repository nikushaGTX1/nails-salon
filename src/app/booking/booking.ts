import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';

@Component({ selector: 'app-booking', standalone: false, templateUrl: './booking.html' })
export class Booking {
  constructor(readonly i18n: TranslationService) {}
}
