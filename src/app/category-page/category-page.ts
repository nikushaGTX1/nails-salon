import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({
  selector: 'app-category-page',
  standalone: false,
  templateUrl: './category-page.html',
})
export class CategoryPage {
  private readonly route = inject(ActivatedRoute);
  readonly categoryId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}

  category() {
    return this.site.categories().find((c) => c.id === this.categoryId());
  }

  groups() {
    return this.site.categoryGroups(this.categoryId(), this.i18n.language());
  }

  rowOpen: Record<string, boolean> = {};

  toggleRow(key: string): void {
    this.rowOpen[key] = !this.rowOpen[key];
  }
}
