import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Language, TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({ selector: 'app-navigation', standalone: false, templateUrl: './navigation.html' })
export class Navigation {
  menuOpen = false;
  scrolled = false;

  readonly languages: Language[] = ['en', 'ka', 'ru'];
  constructor(
    readonly router: Router,
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}

  get isInnerPage(): boolean {
    return this.router.url.split('#')[0] !== '/';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.setScrollLock(this.menuOpen);
  }

  private setScrollLock(locked: boolean): void {
    const value = locked ? 'hidden' : '';
    document.body.style.overflow = value;
    document.documentElement.style.overflow = value;
    // iOS Safari: prevent rubber-band / touch scroll behind the overlay
    document.body.style.touchAction = locked ? 'none' : '';
    document.body.style.overscrollBehavior = locked ? 'none' : '';
  }

  navigateToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    this.closeMenu();

    this.router.navigate(['/'], { fragment: sectionId }).then(() => {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 30;
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen = false;
    this.setScrollLock(false);
  }
}
