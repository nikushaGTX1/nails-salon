import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslationService } from '../translation.service';

interface Location {
  number: string;
  area: string;
  addressKey: string;
  phone: string;
  phoneHref: string;
  map: SafeResourceUrl;
  directions: string;
}

@Component({ selector: 'app-locations', standalone: false, templateUrl: './locations.html' })
export class Locations {
  readonly locations: Location[];
  constructor(sanitizer: DomSanitizer, readonly i18n: TranslationService) {
    const branches = [
      [
        '01',
        'Vera',
        'veraAddress',
        '+995 551 96 00 99',
        '+995551960099',
        '41.7067593,44.7836383',
      ],
      [
        '02',
        'Vake',
        'vakeAddress',
        '+995 595 96 00 99',
        '+995595960099',
        '41.7080588,44.7743022',
      ],
      [
        '03',
        'Saburtalo',
        'saburtaloAddress',
        '+995 596 96 00 99',
        '+995596960099',
        '41.7240134,44.7472866',
      ],
    ];
    this.locations = branches.map(([number, area, addressKey, phone, phoneHref, coordinates]) => ({
      number,
      area,
      addressKey,
      phone,
      phoneHref,
      map: sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${coordinates}&z=16&output=embed`,
      ),
      directions: `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
    }));
  }
}
