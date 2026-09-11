import { Component } from '@angular/core';
import { SiteContentService } from '../site-content.service';
@Component({ selector: 'app-site-footer', standalone: false, templateUrl: './site-footer.html' })
export class SiteFooter {
  constructor(readonly site: SiteContentService) {}
}
