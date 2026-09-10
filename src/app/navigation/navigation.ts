import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Language, TranslationService } from '../translation.service';

@Component({ selector: 'app-navigation', standalone: false, templateUrl: './navigation.html' })
export class Navigation {
  menuOpen = false;
  scrolled = false;

  readonly languages: Language[] = ['en', 'ka', 'ru'];
  constructor(readonly router: Router, readonly i18n: TranslationService) {}

  get isInnerPage(): boolean {
    return this.router.url.split('#')[0] !== '/';
  }

  navigateToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    this.menuOpen = false;

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
  }
}
