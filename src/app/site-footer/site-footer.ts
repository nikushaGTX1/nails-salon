import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
@Component({ selector: 'app-site-footer', standalone: false, templateUrl: './site-footer.html' })
export class SiteFooter { constructor(readonly i18n: TranslationService, readonly site: SiteContentService) {} }
