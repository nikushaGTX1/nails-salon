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

  save(): void {
    if (!this.editMode.token) return;
    this.saving = true;
    this.status = '';
    this.site.save(this.site.content(), this.editMode.token).subscribe({
      next: () => {
        this.saving = false;
        this.editMode.dirty.set(false);
        this.status = 'Saved.';
      },
      error: () => {
        this.saving = false;
        this.status = 'Could not save — try again.';
      },
    });
  }

  exit(): void {
    if (this.editMode.dirty() && !confirm('You have unsaved changes. Discard them and exit?')) return;
    this.editMode.exit();
    this.site.reload();
  }
}
