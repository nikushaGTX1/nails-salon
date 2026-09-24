import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface SiteContent {
  translations: Record<string, Record<string, string>>;
  media: Record<string, string>;
  settings: Record<string, string>;
  services: CmsService[];
  gallery: CmsGalleryItem[];
  locations: CmsLocation[];
  categories: CmsCategory[];
  updatedAt?: string;
}
export type LocalizedText = Record<string, string>;
export interface CmsService {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  /** Empty = shown in the flat homepage service list. Set = grouped under a category's accordion page. */
  categoryId: string;
  /** Top-level accordion group within a category, e.g. "Маникюр" / "Пилочный". */
  groupLabel: LocalizedText;
  /** Expandable row label within a group, e.g. "С покрытием". */
  subgroupLabel: LocalizedText;
  imageUrl: string;
}
export interface CmsCategory {
  id: string;
  name: LocalizedText;
  imageUrl: string;
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
export interface BookingSubmission {
  name: string;
  phone: string;
  studioId: string;
  studio: string;
  serviceId: string;
  service: string;
  date: string;
  time: string;
}
export interface BookingRecord extends BookingSubmission {
  id: number;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export const DEFAULT_SERVICES: CmsService[] = [
  {
    id: 'service-1',
    name: { en: 'Manicure', ka: 'მანიკური', ru: 'Маникюр' },
    description: { en: 'Expert nail shaping, cuticle care and a polished finish.', ka: 'ფრჩხილების ფორმირება, კუტიკულის მოვლა და სასურველი დაფარვა.', ru: 'Форма ногтей, уход за кутикулой и покрытие на ваш выбор.' },
    price: 55,
    categoryId: '',
    groupLabel: {},
    subgroupLabel: {},
    imageUrl: '/assets/services/signature-manicure.png',
  },
  {
    id: 'service-2',
    name: { en: 'Pedicure', ka: 'პედიკური', ru: 'Педикюр' },
    description: { en: 'Care for your feet and toes, finished with your choice of polish.', ka: 'ტერფებისა და ფრჩხილების მოვლა სასურველი დაფარვით.', ru: 'Уход за стопами и ногтями с покрытием на ваш выбор.' },
    price: 75,
    categoryId: '',
    groupLabel: {},
    subgroupLabel: {},
    imageUrl: '/assets/services/essential-pedicure.png',
  },
  {
    id: 'service-3',
    name: { en: 'Nail extensions', ka: 'დაგრძელება', ru: 'Наращивание ногтей' },
    description: { en: 'Length and shape tailored to your hands, with a natural finish.', ka: 'ფრჩხილების დაგრძელება თქვენთვის სასურველი ფორმითა და სიგრძით.', ru: 'Длина и форма ногтей по вашему желанию с естественным результатом.' },
    price: 70,
    categoryId: '',
    groupLabel: {},
    subgroupLabel: {},
    imageUrl: '/assets/services/nail-extensions.png',
  },
  {
    id: 'service-4',
    name: { en: 'Brows', ka: 'წარბი', ru: 'Брови' },
    description: { en: 'Brow shaping, tinting and lamination to frame your face.', ka: 'წარბის ფორმირება, შეღებვა და ლამინირება.', ru: 'Коррекция, окрашивание и ламинирование бровей.' },
    price: 15,
    categoryId: '',
    groupLabel: {},
    subgroupLabel: {},
    imageUrl: '/assets/services/eyebrows.png',
  },
  {
    id: '72c45acf-1173-4936-b947-38ad9f17f29b',
    name: { en: 'Lash extensions', ka: 'წამწამების დაგრძელება', ru: 'Наращивание ресниц' },
    description: { en: 'Lash extensions styled for soft definition and a fuller look.', ka: 'წამწამების დაგრძელება ბუნებრივი ან უფრო გამოკვეთილი ეფექტით.', ru: 'Наращивание ресниц для естественного или более выразительного взгляда.' },
    price: 0,
    categoryId: '',
    groupLabel: {},
    subgroupLabel: {},
    imageUrl: '/assets/services/lash-extensions.png',
  },
];
/** Each line is "Title | information". */
export const DEFAULT_SUB_SERVICES: Record<string, Record<string, string[]>> = {
  "service-1": {
    "en": [
      "With coating | Classic manicure finished with a coating of your choice.",
      "Without coating | Classic manicure with cuticle care and nail shaping, without polish.",
      "With extensions | Manicure with nail extensions and a finish of your choice.",
      "With correction | Correction of existing extensions, with a finish of your choice."
    ],
    "ka": [
      "დაფარვით | კლასიკური მანიკური თქვენთვის სასურველი საფარით.",
      "დაფარვის გარეშე | კლასიკური მანიკური კუტიკულის მოვლითა და ფრჩხილების ფორმირებით, ლაქის გარეშე.",
      "ნამატით | მანიკური ფრჩხილების დაგრძელებითა და თქვენთვის სასურველი საფარით.",
      "კორექციით | არსებული ნამატის კორექცია თქვენთვის სასურველი საფარით."
    ],
    "ru": [
      "С покрытием | Классический маникюр с покрытием на ваш выбор.",
      "Без покрытия | Классический маникюр с уходом за кутикулой и формированием ногтей, без покрытия.",
      "С наращиванием | Маникюр с наращиванием ногтей и покрытием на ваш выбор.",
      "С коррекцией | Коррекция нарощенных ногтей с покрытием на ваш выбор."
    ]
  },
  "service-2": {
    "en": [
      "Solid color | Soft gel manicure in a single color of your choice.",
      "French | Soft gel manicure with a French design.",
      "Coating removal | Careful removal of the existing coating.",
      "Nail strengthening | Soft gel manicure to strengthen the natural nail."
    ],
    "ka": [
      "ერთფერადი დაფარვა | გელ-ლაქის მანიკური თქვენთვის სასურველი ერთი ფერით.",
      "ფრენჩი | გელ-ლაქის მანიკური ფრენჩის დიზაინით.",
      "დაფარვის მოხსნა | არსებული საფარის ფრთხილი მოხსნა.",
      "ფრჩხილების გამაგრება | მანიკური ბუნებრივი ფრჩხილების გამაგრებით."
    ],
    "ru": [
      "Однотонное покрытие | Маникюр с гель-лаком в одном цвете на ваш выбор.",
      "Френч | Маникюр с гель-лаком и дизайном френч.",
      "Снятие покрытия | Аккуратное снятие имеющегося покрытия.",
      "Укрепление ногтей | Маникюр с укреплением натуральных ногтей."
    ]
  },
  "service-3": {
    "en": [
      "With coating | Pedicure finished with a coating of your choice.",
      "Without coating | Pedicure with foot and nail care, without polish.",
      "Foot care | Care for the skin of the feet."
    ],
    "ka": [
      "დაფარვით | პედიკური თქვენთვის სასურველი საფარით.",
      "დაფარვის გარეშე | პედიკური ტერფისა და ფრჩხილების მოვლით, ლაქის გარეშე.",
      "ტერფის მოვლა | ტერფის კანის მოვლა."
    ],
    "ru": [
      "С покрытием | Педикюр с покрытием на ваш выбор.",
      "Без покрытия | Педикюр с уходом за стопами и ногтями, без покрытия.",
      "Уход за стопами | Уход за кожей стоп."
    ]
  },
  "service-4": {
    "en": [
      "French | French nail design.",
      "Hand-painted art | Individual hand-painted nail art.",
      "Rhinestones and decor | Nail decoration with rhinestones and other details."
    ],
    "ka": [
      "ფრენჩი | ფრჩხილების ფრენჩის დიზაინი.",
      "ხატვა | ფრჩხილების ინდივიდუალური მხატვრული მოხატვა.",
      "სტრასები და დეკორი | ფრჩხილების მორთვა სტრასებითა და სხვა დეტალებით."
    ],
    "ru": [
      "Френч | Дизайн ногтей френч.",
      "Роспись | Индивидуальная художественная роспись ногтей.",
      "Стразы и декор | Украшение ногтей стразами и другими деталями."
    ]
  }
};
export const DEFAULT_CATEGORIES: CmsCategory[] = [];
export const DEFAULT_GALLERY: CmsGalleryItem[] = [
  {
    id: 'work-1',
    title: { en: 'Velvet wine', ka: '', ru: '' },
    category: 'manicure',
    imageUrl: 'https://loremflickr.com/800/800/rednails?lock=11',
    position: '0% 0%',
  },
  {
    id: 'work-2',
    title: { en: 'Olive study', ka: '', ru: '' },
    category: 'manicure',
    imageUrl: 'https://loremflickr.com/800/800/nailpolish?lock=12',
    position: '50% 0%',
  },
  {
    id: 'work-3',
    title: { en: 'Blush steps', ka: '', ru: '' },
    category: 'pedicure',
    imageUrl: 'https://loremflickr.com/800/800/pedicure?lock=13',
    position: '100% 0%',
  },
  {
    id: 'work-4',
    title: { en: 'Quiet pink', ka: '', ru: '' },
    category: 'manicure',
    imageUrl: 'https://loremflickr.com/800/800/pinknails?lock=14',
    position: '0% 100%',
  },
  {
    id: 'work-5',
    title: { en: 'Golden lines', ka: '', ru: '' },
    category: 'nailArt',
    imageUrl: 'https://loremflickr.com/800/800/nailart?lock=15',
    position: '50% 100%',
  },
  {
    id: 'work-6',
    title: { en: 'Red hour', ka: '', ru: '' },
    category: 'pedicure',
    imageUrl: 'https://loremflickr.com/800/800/pedicurespa?lock=16',
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

const CONTENT_CACHE_KEY = 'nailbar-content-cache';

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  readonly apiUrl =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5206'
      : 'https://nails-api-production.up.railway.app';
  readonly content = signal<SiteContent>(this.readCache() ?? {
    translations: {},
    media: {},
    settings: {},
    services: [],
    gallery: [],
    locations: [],
    categories: [],
  });
  /**
   * A visitor's last-fetched content is cached so the next page load can render it immediately —
   * instead of a few seconds of fallback/blank while the API (often cold-starting on Railway)
   * responds — and only swap in anything actually different once the fresh fetch lands.
   */
  readonly loaded = signal(this.readCache() !== null);
  constructor(private readonly http: HttpClient) {
    this.reload();
  }
  reload(): void {
    this.http.get<SiteContent>(`${this.apiUrl}/api/content`).subscribe({
      next: (value) => {
        this.content.set(value);
        this.loaded.set(true);
        this.writeCache(value);
      },
      error: () => this.loaded.set(true),
    });
  }
  /** Called by /admin right after a successful publish, so the very next tab or visit — including
   *  clicking "Preview website" — shows the just-published change immediately, instead of the
   *  previous version until that tab's own background fetch happens to complete. */
  primeCache(value: SiteContent): void {
    this.writeCache(value);
  }
  private readCache(): SiteContent | null {
    try {
      const raw = localStorage.getItem(CONTENT_CACHE_KEY);
      return raw ? (JSON.parse(raw) as SiteContent) : null;
    } catch {
      return null;
    }
  }
  private writeCache(value: SiteContent): void {
    try {
      localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(value));
    } catch {
      // Private browsing or a full quota — caching is a nicety, not required for correctness.
    }
  }
  media(key: string, fallback: string): string {
    const value = this.content().media[key] || fallback;
    return value.startsWith('/uploads/') ? this.apiUrl + value : value;
  }
  asset(value: string, fallback: string): string {
    const url = value || fallback;
    return url.startsWith('/uploads/') ? this.apiUrl + url : url;
  }
  serviceImage(service: CmsService | undefined): string {
    if (!service) return '';
    const curated: Record<string, string> = {
      'service-1': '/assets/services/signature-manicure.png',
      'service-2': '/assets/services/essential-pedicure.png',
      'service-3': '/assets/services/nail-extensions.png',
      'service-4': '/assets/services/eyebrows.png',
      '72c45acf-1173-4936-b947-38ad9f17f29b': '/assets/services/lash-extensions.png',
    };
    const source = service.imageUrl || curated[service.id] || '';
    const selected = source.includes('loremflickr.com') ? curated[service.id] || source : source;
    return this.asset(selected, curated[service.id] || '');
  }
  serviceDescription(service: CmsService, language: string): string {
    // `raw` distinguishes "this language was never saved at all" (undefined — fall back) from
    // "it was saved as an empty string" (deliberately cleared in the editor — show blank). The
    // old version checked truthiness instead, so a cleared field always fell back to this
    // hardcoded English text: clearing it to make it blank was impossible.
    const raw = service.description?.[language];
    const current = raw?.trim();
    const oldEnglish: Record<string, string> = {
      'service-1': 'Detailed cuticle care and your choice of finish.',
      'service-2': 'Long-lasting color with a smooth, natural result.',
      'service-3': 'Restorative care for soft skin and polished toes.',
      'service-4': 'Fine lines, tonal details and unique designs.',
      '72c45acf-1173-4936-b947-38ad9f17f29b': 'Service description',
    };
    if (raw !== undefined && current !== oldEnglish[service.id]) return current ?? '';
    const updated = DEFAULT_SERVICES.find((item) => item.id === service.id);
    return updated?.description[language] || updated?.description['en'] || current || '';
  }
  serviceName(service: CmsService, language: string): string {
    const raw = service.name?.[language];
    const current = raw?.trim();
    const oldEnglish: Record<string, string> = {
      'service-1': 'Signature manicure',
      'service-2': 'Soft gel manicure',
      'service-3': 'Essential pedicure',
      'service-4': 'Bespoke nail art',
      '72c45acf-1173-4936-b947-38ad9f17f29b': 'New service',
    };
    if (raw !== undefined && current !== oldEnglish[service.id]) return current ?? '';
    const updated = DEFAULT_SERVICES.find((item) => item.id === service.id);
    return updated?.name[language] || updated?.name['en'] || current || '';
  }
  galleryImage(item: CmsGalleryItem): string {
    const source = item.imageUrl || '/assets/portfolio.png';
    return source.includes('loremflickr.com')
      ? '/assets/portfolio.png'
      : this.asset(source, '/assets/portfolio.png');
  }
  setting(key: string, fallback: string): string {
    return this.content().settings[key] || fallback;
  }
  /** Loyalty / cashback settings (editable in /admin → Business details). */
  loyaltyStandardRate(): number {
    const raw = Number(this.content().settings['loyaltyStandardRate']);
    return Number.isFinite(raw) && raw > 0 && raw < 100 ? raw : 3;
  }
  loyaltyBirthdayRate(): number {
    const raw = Number(this.content().settings['loyaltyBirthdayRate']);
    return Number.isFinite(raw) && raw > 0 && raw < 100 ? raw : 40;
  }
  loyaltyExampleBalance(): number {
    const raw = Number(this.content().settings['loyaltyExampleBalance']);
    return Number.isFinite(raw) && raw >= 0 ? raw : 24.5;
  }
  /** Live-edit mode: patches one UI dictionary string in place (see TranslationService.t()'s CMS-override lookup). */
  setTranslation(language: string, key: string, value: string): void {
    this.content.update((c) => ({
      ...c,
      translations: {
        ...c.translations,
        [language]: { ...c.translations[language], [key]: value },
      },
    }));
  }
  /** Live-edit mode: patches one CMS media slot (e.g. hero poster) in place. */
  setMedia(key: string, url: string): void {
    this.content.update((c) => ({ ...c, media: { ...c.media, [key]: url } }));
  }
  /** Live-edit mode: generic key/value patch, used for per-element style overrides (e.g. font size). */
  setSetting(key: string, value: string): void {
    this.content.update((c) => ({ ...c, settings: { ...c.settings, [key]: value } }));
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
  /** Salon's primary contact number, reused wherever a single phone CTA is needed. */
  primaryPhone(): string {
    return this.locations()[0]?.phone ?? '';
  }
  phoneHref(phone: string): string {
    return phone.replace(/[^+\d]/g, '');
  }
  /** Sub-services listed on a service's page. Admin list (settings "sub:<serviceId>:<lang>", one "Title | information" per line) wins over the defaults. */
  subServices(serviceId: string, language: string): { title: string; info: string }[] {
    const settings = this.content().settings;
    const matchingDefaults: Record<string, Record<string, string[]>> = {
      'service-2': {
        en: ['With polish | Foot and nail care finished with your choice of polish.', 'Without polish | Foot and nail care with a clean natural finish.'],
        ka: ['დაფარვით | ტერფებისა და ფრჩხილების მოვლა სასურველი დაფარვით.', 'დაფარვის გარეშე | ტერფებისა და ფრჩხილების მოვლა ლაქის გარეშე.'],
        ru: ['С покрытием | Уход за стопами и ногтями с покрытием на ваш выбор.', 'Без покрытия | Уход за стопами и ногтями без лака.'],
      },
      'service-3': {
        en: ['Extensions | Nail length and shape tailored to your hands.', 'Correction | Refresh and reshape existing extensions.'],
        ka: ['დაგრძელება | ფრჩხილების დაგრძელება სასურველი ფორმითა და სიგრძით.', 'კორექცია | დაგრძელებული ფრჩხილების განახლება და ფორმირება.'],
        ru: ['Наращивание | Длина и форма ногтей по вашему желанию.', 'Коррекция | Обновление формы и покрытия нарощенных ногтей.'],
      },
      'service-4': {
        en: ['Shaping | Brow shaping to suit your features.', 'Tinting | Brow color for a defined look.', 'Lamination | Brow styling for a fuller, groomed finish.'],
        ka: ['ფორმირება | წარბის ფორმის მორგება სახის ნაკვთებზე.', 'შეღებვა | წარბის ფერის გამოკვეთა.', 'ლამინირება | წარბის მოწესრიგება და მოცულობის ეფექტი.'],
        ru: ['Коррекция | Форма бровей с учетом черт лица.', 'Окрашивание | Выразительный цвет бровей.', 'Ламинирование | Укладка бровей для ухоженного вида.'],
      },
      '72c45acf-1173-4936-b947-38ad9f17f29b': {
        en: ['Lash extensions | Choose a soft natural or fuller lash look.'],
        ka: ['წამწამების დაგრძელება | აირჩიეთ ბუნებრივი ან უფრო გამოკვეთილი ეფექტი.'],
        ru: ['Наращивание ресниц | Естественный или более выразительный эффект на ваш выбор.'],
      },
    };
    const defaults = matchingDefaults[serviceId] || DEFAULT_SUB_SERVICES[serviceId];
    const parse = (raw: string | undefined) =>
      (raw ?? '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const cut = line.indexOf('|');
          return cut < 0
            ? { title: line, info: '' }
            : { title: line.slice(0, cut).trim(), info: line.slice(cut + 1).trim() };
        });
    for (const lang of [language, 'en']) {
      const admin = parse(settings['sub:' + serviceId + ':' + lang]);
      if (admin.length) return admin;
      const fallback = parse(defaults?.[lang]?.join('\n'));
      if (fallback.length) return fallback;
    }
    return [];
  }
  /** Portfolio is hidden unless enabled in /admin (settings "showPortfolio" = "1"). */
  portfolioVisible(): boolean {
    return this.content().settings['showPortfolio'] === '1';
  }
  categories(): CmsCategory[] {
    return this.content().categories?.length ? this.content().categories : DEFAULT_CATEGORIES;
  }
  /** Services attached to a category, grouped by groupLabel then subgroupLabel, for the category accordion page. */
  categoryGroups(
    categoryId: string,
    language: string,
  ): { title: string; rows: { label: string; items: CmsService[] }[] }[] {
    const items = this.services().filter((s) => s.categoryId === categoryId);
    const groupOrder: string[] = [];
    const groups = new Map<string, Map<string, CmsService[]>>();
    for (const item of items) {
      const groupKey = this.localized(item.groupLabel, language, '');
      const rowKey = this.localized(item.subgroupLabel, language, '');
      if (!groups.has(groupKey)) {
        groups.set(groupKey, new Map());
        groupOrder.push(groupKey);
      }
      const rows = groups.get(groupKey)!;
      if (!rows.has(rowKey)) rows.set(rowKey, []);
      rows.get(rowKey)!.push(item);
    }
    return groupOrder.map((title) => ({
      title,
      rows: Array.from(groups.get(title)!.entries()).map(([label, rowItems]) => ({
        label,
        items: rowItems,
      })),
    }));
  }
  login(password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/api/admin/login`, { password });
  }
  createBooking(booking: BookingSubmission) {
    return this.http.post<BookingRecord>(`${this.apiUrl}/api/bookings`, booking);
  }
  bookings(token: string) {
    return this.http.get<BookingRecord[]>(`${this.apiUrl}/api/admin/bookings`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
  deleteBooking(id: number, token: string) {
    return this.http.delete<void>(`${this.apiUrl}/api/admin/bookings/${id}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
  updateBookingStatus(id: number, status: BookingRecord['status'], token: string) {
    return this.http.put<void>(
      `${this.apiUrl}/api/admin/bookings/${id}/status`,
      { status },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
    );
  }
  validateSession(token: string) {
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/api/admin/session`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
  /** Fetches the current server content without touching the shared `content` signal — used to detect edit conflicts before saving in /admin. */
  fetchLatest() {
    return this.http.get<SiteContent>(`${this.apiUrl}/api/content`);
  }
  save(content: SiteContent, token: string, force = false) {
    return this.http.put<SiteContent>(`${this.apiUrl}/api/admin/content?force=${force}`, content, {
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
