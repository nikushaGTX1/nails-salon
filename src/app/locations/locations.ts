import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Location {
  number: string;
  area: string;
  address: string;
  phone: string;
  phoneHref: string;
  map: SafeResourceUrl;
  directions: string;
}

@Component({ selector: 'app-locations', standalone: false, templateUrl: './locations.html' })
export class Locations {
  readonly locations: Location[];
  constructor(sanitizer: DomSanitizer) {
    const branches = [
      [
        '01',
        'Vera',
        '2 Ivane Tarkhnishvili St.',
        '+995 551 96 00 99',
        '+995551960099',
        '41.7067593,44.7836383',
      ],
      [
        '02',
        'Vake',
        '17 Zakaria Paliashvili St.',
        '+995 595 96 00 99',
        '+995595960099',
        '41.7080588,44.7743022',
      ],
      [
        '03',
        'Saburtalo',
        '24G Alexander Kazbegi Ave.',
        '+995 596 96 00 99',
        '+995596960099',
        '41.7240134,44.7472866',
      ],
    ];
    this.locations = branches.map(([number, area, address, phone, phoneHref, coordinates]) => ({
      number,
      area,
      address,
      phone,
      phoneHref,
      map: sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${coordinates}&z=16&output=embed`,
      ),
      directions: `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
    }));
  }
}
