import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditModeService {
  readonly active = signal(false);
  readonly dirty = signal(false);

  get token(): string {
    return sessionStorage.getItem('nailbar-admin-token') || '';
  }

  /** The one check every editing directive must use — true only while edit mode was explicitly
   *  entered AND a valid admin token is still present in this browser tab right now. Re-checks
   *  the token live (not cached) so a cleared/expired session can never leave editing UI showing. */
  isEditing(): boolean {
    return this.active() && !!this.token;
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
