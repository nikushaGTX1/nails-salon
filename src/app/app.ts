import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from './translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  constructor(
    readonly i18n: TranslationService,
    readonly router: Router,
  ) {}
}
