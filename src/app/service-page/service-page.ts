import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslationService } from '../translation.service';
import { SiteContentService } from '../site-content.service';
import { EditModeService } from '../edit-mode.service';

@Component({
  selector: 'app-service-page',
  standalone: false,
  templateUrl: './service-page.html',
})
export class ServicePage {
  private readonly route = inject(ActivatedRoute);
  readonly serviceId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  constructor(
    readonly i18n: TranslationService,
    readonly site: SiteContentService,
    readonly editMode: EditModeService,
  ) {}

  service() {
    return this.site.services().find((s) => s.id === this.serviceId());
  }

  otherServices() {
    return this.site
      .services()
      .filter((s) => s.id !== this.serviceId())
      .slice(0, 3);
  }

  imageSetter(): (url: string) => void {
    return (url: string) => {
      const service = this.service();
      if (service) service.imageUrl = url;
    };
  }

  category() {
    const categoryId = this.service()?.categoryId;
    if (!categoryId) return undefined;
    return this.site.categories().find((c) => c.id === categoryId);
  }

  fieldSetter(target: Record<string, string> | undefined, lang: string): (value: string) => void {
    return (value: string) => {
      if (target) target[lang] = value;
    };
  }

  priceSetter(): (value: string) => void {
    return (value: string) => {
      const service = this.service();
      if (!service) return;
      const parsed = Number(value.replace(/[^\d.]/g, ''));
      if (!Number.isNaN(parsed)) service.price = parsed;
    };
  }
}
