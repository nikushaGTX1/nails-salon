import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';

@Component({
  selector: 'app-attention-to-detail',
  standalone: false,
  templateUrl: './attention-to-detail.html',
})
export class AttentionToDetail {
  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
  ) {}
}
