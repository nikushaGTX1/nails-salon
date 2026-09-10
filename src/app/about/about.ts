import { Component } from '@angular/core';
import { TranslationService } from '../translation.service';
@Component({ selector: 'app-about', standalone: false, templateUrl: './about.html' })
export class About { constructor(readonly i18n: TranslationService) {} }
