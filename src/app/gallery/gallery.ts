import { Component } from '@angular/core';

interface Work {
  title: string;
  category: string;
  position: string;
}

@Component({ selector: 'app-gallery', standalone: false, templateUrl: './gallery.html' })
export class Gallery {
  readonly filters = ['All', 'Manicure', 'Pedicure', 'Nail art'];
  activeFilter = 'All';
  readonly works: Work[] = [
    { title: 'Velvet wine', category: 'Manicure', position: '0% 0%' },
    { title: 'Olive study', category: 'Manicure', position: '50% 0%' },
    { title: 'Blush steps', category: 'Pedicure', position: '100% 0%' },
    { title: 'Quiet pink', category: 'Manicure', position: '0% 100%' },
    { title: 'Golden lines', category: 'Nail art', position: '50% 100%' },
    { title: 'Red hour', category: 'Pedicure', position: '100% 100%' },
  ];
  get filteredWorks(): Work[] {
    return this.activeFilter === 'All'
      ? this.works
      : this.works.filter((work) => work.category === this.activeFilter);
  }
}
