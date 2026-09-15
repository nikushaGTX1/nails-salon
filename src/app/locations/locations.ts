import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslationService } from '../translation.service';
import { CmsLocation, SiteContentService } from '../site-content.service';

@Component({ selector: 'app-locations', standalone: false, templateUrl: './locations.html' })
export class Locations {
  constructor(
    private readonly sanitizer: DomSanitizer,
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
  fieldSetter(target: Record<string, string>, lang: string): (value: string) => void {
    return (value: string) => {
      target[lang] = value;
    };
  }
  phoneSetter(location: CmsLocation): (value: string) => void {
    return (value: string) => {
      location.phone = value;
    };
  }
  map(coordinates: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${coordinates}&z=16&output=embed`,
    );
  }
  directions(coordinates: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
  }
  phoneHref(phone: string): string {
    return phone.replace(/[^+\d]/g, '');
  }
}
