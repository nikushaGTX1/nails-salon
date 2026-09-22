import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslationService } from '../translation.service';
import { CmsService, SiteContentService } from '../site-content.service';
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

  serviceName(service: CmsService | undefined): string {
    if (!service) return '';
    return this.site.serviceName(service, this.i18n.language());
  }

  category() {
    const categoryId = this.service()?.categoryId;
    if (!categoryId) return undefined;
    return this.site.categories().find((c) => c.id === categoryId);
  }

  rowOpen: Record<number, boolean> = {};

  rows(): { title: string; info: string }[] {
    const service = this.service();
    if (!service) return [];
    const subs = this.site.subServices(service.id, this.i18n.language());
    if (subs.length) return subs;
    return [
      {
        title: this.serviceName(service),
        info: this.site.serviceDescription(service, this.i18n.language()),
      },
    ];
  }

  toggleRow(index: number): void {
    this.rowOpen[index] = !this.rowOpen[index];
  }

  imageSetter(): (url: string) => void {
    return (url: string) => {
      const service = this.service();
      if (service) service.imageUrl = url;
    };
  }

  fieldSetter(target: Record<string, string> | undefined, lang: string): (value: string) => void {
    return (value: string) => {
      if (target) target[lang] = value;
    };
  }
}
