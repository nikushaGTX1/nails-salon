import { Component } from '@angular/core';

interface Service {
  name: string;
  description: string;
  price: number;
}

@Component({ selector: 'app-services', standalone: false, templateUrl: './services.html' })
export class Services {
  readonly services: Service[] = [
    {
      name: 'Signature manicure',
      description: 'Detailed cuticle care and your choice of finish.',
      price: 55,
    },
    {
      name: 'Soft gel manicure',
      description: 'Long-lasting color with a smooth, natural result.',
      price: 75,
    },
    {
      name: 'Essential pedicure',
      description: 'Restorative care for soft skin and polished toes.',
      price: 70,
    },
    {
      name: 'Bespoke nail art',
      description: 'Fine lines, tonal details and unique designs.',
      price: 15,
    },
  ];
}
