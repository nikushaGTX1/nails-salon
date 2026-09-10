import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';

interface Service {
  key: string;
  price: number;
}

@Component({ selector: 'app-services', standalone: false, templateUrl: './services.html' })
export class Services {
  constructor(readonly i18n: TranslationService) {}
  readonly services: Service[] = [
    { key: '1', price: 55 }, { key: '2', price: 75 },
    { key: '3', price: 70 }, { key: '4', price: 15 },
  ];
}
