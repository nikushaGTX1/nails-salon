import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslationService } from '../translation.service';
import { CmsLocation, SiteContentService } from '../site-content.service';
import { EditModeService } from '../edit-mode.service';

@Component({ selector: 'app-four-hands', standalone: false, templateUrl: './four-hands.html' })
export class FourHands {
  menuOpen = false;

  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
    readonly editMode: EditModeService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  toggleMenu(): void {
    if (!this.editMode.isEditing()) this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen = false;
  }

  directions(coordinates: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
  }

  phoneHref(phone: string): string {
    return phone.replace(/[^+\d]/g, '');
  }

  vakeLocation(): CmsLocation | undefined {
    return this.site.locations().find((location) => location.id.toLowerCase() === 'vake');
  }

  map(coordinates: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${coordinates}&z=16&output=embed`,
    );
  }
}
