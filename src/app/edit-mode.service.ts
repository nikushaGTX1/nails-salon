import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditModeService {
  readonly active = signal(false);
  readonly dirty = signal(false);

  get token(): string {
    return sessionStorage.getItem('nailbar-admin-token') || '';
  }

  enter(): boolean {
    if (!this.token) return false;
    this.active.set(true);
    return true;
  }

  exit(): void {
    this.active.set(false);
    this.dirty.set(false);
  }
}
