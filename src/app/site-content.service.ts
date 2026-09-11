import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface SiteContent {
  translations: Record<string, Record<string, string>>;
  media: Record<string, string>;
  settings: Record<string, string>;
  services: CmsService[];
  gallery: CmsGalleryItem[];
  locations: CmsLocation[];
  updatedAt?: string;
}
export type LocalizedText = Record<string, string>;
export interface CmsService {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
}
export interface CmsGalleryItem {
  id: string;
  title: LocalizedText;
  category: string;
  imageUrl: string;
  position: string;
}
export interface CmsLocation {
  id: string;
  area: string;
  address: LocalizedText;
  phone: string;
  coordinates: string;
}

export const DEFAULT_SERVICES: CmsService[] = [
  {
    id: 'service-1',
    name: { en: 'Signature manicure', ka: '', ru: '' },
    description: { en: 'Detailed cuticle care and your choice of finish.', ka: '', ru: '' },
    price: 55,
  },
  {
    id: 'service-2',
    name: { en: 'Soft gel manicure', ka: '', ru: '' },
    description: { en: 'Long-lasting color with a smooth, natural result.', ka: '', ru: '' },
    price: 75,
  },
  {
    id: 'service-3',
    name: { en: 'Essential pedicure', ka: '', ru: '' },
    description: { en: 'Restorative care for soft skin and polished toes.', ka: '', ru: '' },
    price: 70,
  },
  {
    id: 'service-4',
    name: { en: 'Bespoke nail art', ka: '', ru: '' },
    description: { en: 'Fine lines, tonal details and unique designs.', ka: '', ru: '' },
    price: 15,
  },
];
export const DEFAULT_GALLERY: CmsGalleryItem[] = [
  {
    id: 'work-1',
    title: { en: 'Velvet wine', ka: '', ru: '' },
    category: 'manicure',
    imageUrl: '',
    position: '0% 0%',
  },
  {
    id: 'work-2',
    title: { en: 'Olive study', ka: '', ru: '' },
    category: 'manicure',
    imageUrl: '',
    position: '50% 0%',
  },
  {
    id: 'work-3',
    title: { en: 'Blush steps', ka: '', ru: '' },
    category: 'pedicure',
    imageUrl: '',
    position: '100% 0%',
  },
  {
    id: 'work-4',
    title: { en: 'Quiet pink', ka: '', ru: '' },
    category: 'manicure',
    imageUrl: '',
    position: '0% 100%',
  },
  {
    id: 'work-5',
    title: { en: 'Golden lines', ka: '', ru: '' },
    category: 'nailArt',
    imageUrl: '',
    position: '50% 100%',
  },
  {
    id: 'work-6',
    title: { en: 'Red hour', ka: '', ru: '' },
    category: 'pedicure',
    imageUrl: '',
    position: '100% 100%',
  },
];
export const DEFAULT_LOCATIONS: CmsLocation[] = [
  {
    id: 'vera',
    area: 'Vera',
    address: { en: '2 Ivane Tarkhnishvili St.', ka: '', ru: '' },
    phone: '+995 551 96 00 99',
    coordinates: '41.7067593,44.7836383',
  },
  {
    id: 'vake',
    area: 'Vake',
    address: { en: '17 Zakaria Paliashvili St.', ka: '', ru: '' },
    phone: '+995 595 96 00 99',
    coordinates: '41.7080588,44.7743022',
  },
  {
    id: 'saburtalo',
    area: 'Saburtalo',
    address: { en: '24G Alexander Kazbegi Ave.', ka: '', ru: '' },
    phone: '+995 596 96 00 99',
    coordinates: '41.7240134,44.7472866',
  },
];

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  readonly apiUrl = 'http://localhost:5206';
  readonly content = signal<SiteContent>({
    translations: {},
    media: {},
    settings: {},
    services: [],
    gallery: [],
    locations: [],
  });
  readonly loaded = signal(false);
  constructor(private readonly http: HttpClient) {
    this.reload();
  }
  reload(): void {
    this.http.get<SiteContent>(`${this.apiUrl}/api/content`).subscribe({
      next: (value) => {
        this.content.set(value);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }
  media(key: string, fallback: string): string {
    const value = this.content().media[key] || fallback;
    return value.startsWith('/uploads/') ? this.apiUrl + value : value;
  }
  asset(value: string, fallback: string): string {
    const url = value || fallback;
    return url.startsWith('/uploads/') ? this.apiUrl + url : url;
  }
  setting(key: string, fallback: string): string {
    return this.content().settings[key] || fallback;
  }
  localized(value: LocalizedText | undefined, language: string, fallback = ''): string {
    return value?.[language] || fallback || value?.['en'] || '';
  }
  services(): CmsService[] {
    return this.content().services?.length ? this.content().services : DEFAULT_SERVICES;
  }
  gallery(): CmsGalleryItem[] {
    return this.content().gallery?.length ? this.content().gallery : DEFAULT_GALLERY;
  }
  locations(): CmsLocation[] {
    return this.content().locations?.length ? this.content().locations : DEFAULT_LOCATIONS;
  }
  login(password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/api/admin/login`, { password });
  }
  validateSession(token: string) {
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/api/admin/session`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
  save(content: SiteContent, token: string) {
    return this.http.put<SiteContent>(`${this.apiUrl}/api/admin/content`, content, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
  upload(file: File, token: string) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/api/admin/media`, form, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      observe: 'events',
      reportProgress: true,
    });
  }
  changePassword(currentPassword: string, newPassword: string, token: string) {
    return this.http.post<{ token: string; message: string }>(
      `${this.apiUrl}/api/admin/change-password`,
      { currentPassword, newPassword },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
    );
  }
}
