import { Component } from '@angular/core';
import { EditModeService } from '../edit-mode.service';
import { SiteContentService } from '../site-content.service';

@Component({
  selector: 'app-edit-toolbar',
  standalone: false,
  templateUrl: './edit-toolbar.html',
})
export class EditToolbar {
  saving = false;
  status = '';

  constructor(
    readonly editMode: EditModeService,
    private readonly site: SiteContentService,
  ) {}

  /**
   * Whoever is editing the live page directly is, by definition, looking at the current site
   * right now — so unlike the admin dashboard (where a stale tab genuinely might be behind),
   * a conflict here always retries with force once rather than leaving the person stuck re-
   * clicking Save on a change (a font-size tweak, a text edit) that can never go through. Without
   * this, any conflict here looked exactly like "my edit just doesn't save."
   */
  save(force = false): void {
    if (!this.editMode.token) return;
    this.saving = true;
    this.status = force ? 'Saving…' : '';
    this.site.save(this.site.content(), this.editMode.token, force).subscribe({
      next: (saved) => {
        this.saving = false;
        this.editMode.dirty.set(false);
        this.site.content.set(saved);
        this.site.primeCache(saved);
        this.status = 'Saved.';
      },
      error: (e) => {
        if (e.status === 409 && !force) {
          this.save(true);
          return;
        }
        this.saving = false;
        this.status = e.error?.message || 'Could not save — try again.';
      },
    });
  }

  exit(): void {
    if (this.editMode.dirty() && !confirm('You have unsaved changes. Discard them and exit?')) return;
    this.editMode.exit();
    this.site.reload();
  }
}
