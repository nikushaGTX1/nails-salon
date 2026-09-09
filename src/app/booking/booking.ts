import { Component } from '@angular/core';
@Component({ selector: 'app-booking', standalone: false, templateUrl: './booking.html' })
export class Booking {
  bookingSent = false;
  submit(event: Event): void {
    event.preventDefault();
    this.bookingSent = true;
  }
}
