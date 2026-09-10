import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
@Component({ selector: 'app-site-footer', standalone: false, templateUrl: './site-footer.html' })
export class SiteFooter { constructor(readonly i18n: TranslationService) {} }
