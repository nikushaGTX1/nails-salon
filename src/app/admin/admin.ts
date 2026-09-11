import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { timeout } from 'rxjs';
import { dictionaries, Language } from '../translation.service';
import {
  CmsGalleryItem,
  CmsLocation,
  CmsService,
  DEFAULT_GALLERY,
  DEFAULT_LOCATIONS,
  DEFAULT_SERVICES,
  SiteContent,
  SiteContentService,
} from '../site-content.service';

interface TextSection {
  id: string;
  title: string;
  description: string;
  keys: string[];
}
interface AdminField {
  key: string;
  label: string;
  fallback: string;
  hint: string;
}

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  password = '';
  token = sessionStorage.getItem('nailbar-admin-token') || '';
  sessionChecking = !!this.token;
  saving = false;
  loggingIn = false;
  error = '';
  status = '';
  activeLanguage: Language = 'en';
  uploading = '';
  uploadProgress = 0;
  search = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;
  readonly openPreviews = new Set<string>();
  readonly languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'ka', name: 'Georgian' },
    { code: 'ru', name: 'Russian' },
  ];
  readonly textSections: TextSection[] = [
    {
      id: 'navigation',
      title: 'Navigation & buttons',
      description: 'Top menu, booking buttons and common action labels.',
      keys: [
        'services',
        'portfolio',
        'about',
        'locations',
        'book',
        'online',
        'explore',
        'viewPortfolio',
        'discover',
        'maps',
        'from',
      ],
    },
    {
      id: 'hero',
      title: 'Homepage hero',
      description: 'The large opening section at the very top of the homepage.',
      keys: ['heroLocation', 'heroTitle', 'heroMeta', 'scroll'],
    },
    {
      id: 'services',
      title: 'Services section',
      description:
        'Section heading and introduction. Manage individual services under “Services & lists”.',
      keys: ['servicesTitle', 'servicesIntro'],
    },
    {
      id: 'portfolio',
      title: 'Portfolio section',
      description:
        'Portfolio heading and filter labels. Manage individual photos under “Services & lists”.',
      keys: ['selectedWork', 'ourPortfolio', 'all', 'manicure', 'pedicure', 'nailArt'],
    },
    {
      id: 'about',
      title: 'About section',
      description: 'Studio story and the three values displayed below the image.',
      keys: ['aboutUs', 'aboutTitle', 'aboutText', 'studio', 'quality', 'artists', 'calm'],
    },
    {
      id: 'locations',
      title: 'Locations section',
      description:
        'Section heading and opening information. Manage studios under “Services & lists”.',
      keys: ['ourLocations', 'locationsTitle', 'locationsText', 'daily'],
    },
    {
      id: 'booking',
      title: 'Booking form',
      description: 'Booking introduction, field labels and confirmation message.',
      keys: [
        'booking',
        'bookingTitle',
        'bookingText',
        'design',
        'extras',
        'name',
        'yourName',
        'phone',
        'studioField',
        'chooseLocation',
        'service',
        'chooseService',
        'date',
        'time',
        'sent',
      ],
    },
    {
      id: 'footer',
      title: 'Footer',
      description: 'Copyright text at the bottom of every page.',
      keys: ['rights'],
    },
    {
      id: 'accessibility',
      title: 'Accessibility labels',
      description: 'Hidden descriptions used by screen readers. Usually no changes are needed.',
      keys: ['openNav', 'closeNav', 'filterPortfolio'],
    },
  ];
  readonly labels: Record<string, string> = {
    services: 'Menu — Services',
    portfolio: 'Menu — Portfolio',
    about: 'Menu — About',
    locations: 'Menu — Locations',
    book: 'Booking button',
    online: 'Floating booking button',
    explore: 'Explore services label',
    viewPortfolio: 'View portfolio button',
    discover: 'Discover studios link',
    maps: 'Google Maps link',
    from: 'Price prefix',
    heroLocation: 'Small location line',
    heroTitle: 'Main headline',
    heroMeta: 'Side keywords',
    scroll: 'Scroll indicator',
    servicesTitle: 'Section headline',
    servicesIntro: 'Section introduction',
    s1: 'Service 1 — Name',
    sd1: 'Service 1 — Description',
    s2: 'Service 2 — Name',
    sd2: 'Service 2 — Description',
    s3: 'Service 3 — Name',
    sd3: 'Service 3 — Description',
    s4: 'Service 4 — Name',
    sd4: 'Service 4 — Description',
    selectedWork: 'Small section label',
    ourPortfolio: 'Portfolio headline',
    all: 'Filter — All',
    manicure: 'Filter/service — Manicure',
    pedicure: 'Filter/service — Pedicure',
    nailArt: 'Filter — Nail art',
    w1: 'Photo 1 caption',
    w2: 'Photo 2 caption',
    w3: 'Photo 3 caption',
    w4: 'Photo 4 caption',
    w5: 'Photo 5 caption',
    w6: 'Photo 6 caption',
    aboutUs: 'Small section label',
    aboutTitle: 'About headline',
    aboutText: 'About paragraph',
    studio: 'Studio image caption',
    quality: 'Value 1',
    artists: 'Value 2',
    calm: 'Value 3',
    ourLocations: 'Small section label',
    locationsTitle: 'Locations headline',
    locationsText: 'Locations introduction',
    veraAddress: 'Vera address',
    vakeAddress: 'Vake address',
    saburtaloAddress: 'Saburtalo address',
    daily: 'Open daily label',
    booking: 'Small section label',
    bookingTitle: 'Booking headline',
    bookingText: 'Booking introduction',
    design: 'Nail design option',
    extras: 'Care & extras option',
    name: 'Name field label',
    yourName: 'Name placeholder',
    phone: 'Phone field label',
    studioField: 'Studio field label',
    chooseLocation: 'Studio placeholder',
    service: 'Service field label',
    chooseService: 'Service placeholder',
    date: 'Date field label',
    time: 'Time field label',
    sent: 'Success message',
    rights: 'Copyright line',
    openNav: 'Open menu label',
    closeNav: 'Close menu label',
    filterPortfolio: 'Portfolio filter label',
  };
  readonly mediaFields: AdminField[] = [
    {
      key: 'logo',
      label: 'Header logo',
      fallback: '/nailbar-transparent.png',
      hint: 'Appears in the top-left corner on every page.',
    },
    {
      key: 'heroVideo',
      label: 'Homepage background video',
      fallback: '/video1.mp4',
      hint: 'Large moving background at the top of the homepage. MP4 or WebM.',
    },
    {
      key: 'heroPoster',
      label: 'Video cover image',
      fallback: '/assets/hero-editorial.png',
      hint: 'Shown while the homepage video is loading.',
    },
    {
      key: 'studioImage',
      label: 'About section image',
      fallback: '/assets/studio-interior.png',
      hint: 'Large studio photo beside the About text.',
    },
    {
      key: 'galleryImage',
      label: 'Portfolio gallery image',
      fallback: '/assets/portfolio.png',
      hint: 'Image used by the six portfolio cards.',
    },
  ];
  readonly settingFields: AdminField[] = [
    {
      key: 'instagramUrl',
      label: 'Instagram link',
      fallback: 'https://instagram.com/nail_bar_1',
      hint: 'Footer Instagram button.',
    },
    {
      key: 'whatsappUrl',
      label: 'WhatsApp link',
      fallback: 'https://wa.me/995551960099',
      hint: 'Footer WhatsApp button.',
    },
    {
      key: 'openingHours',
      label: 'Opening hours',
      fallback: '10:00 — 21:00',
      hint: 'Hours shown under the studio locations.',
    },
  ];
  model: SiteContent = this.makeModel();

  constructor(
    readonly site: SiteContentService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    if (this.token)
      this.site.validateSession(this.token).subscribe({
        next: () => {
          this.sessionChecking = false;
          this.error = '';
          this.refresh();
        },
        error: () => {
          this.token = '';
          this.sessionChecking = false;
          sessionStorage.removeItem('nailbar-admin-token');
          this.error =
            'Your previous session expired after the server restarted. Please sign in again.';
          this.refresh();
        },
      });
    const load = () => (this.model = this.merge(site.content()));
    if (site.loaded()) load();
    else {
      const timer = setInterval(() => {
        if (site.loaded()) {
          clearInterval(timer);
          load();
          this.refresh();
        }
      }, 50);
    }
  }
  get visibleSections(): TextSection[] {
    const query = this.search.trim().toLowerCase();
    if (!query) return this.textSections;
    return this.textSections
      .map((section) => ({
        ...section,
        keys: section.keys.filter((key) =>
          `${this.fieldLabel(key)} ${this.model.translations[this.activeLanguage][key] || ''}`
            .toLowerCase()
            .includes(query),
        ),
      }))
      .filter((section) => section.keys.length);
  }
  fieldLabel(key: string): string {
    return this.labels[key] || key;
  }
  login(): void {
    if (this.loggingIn) return;
    this.loggingIn = true;
    this.error = '';
    this.status = '';
    this.site
      .login(this.password)
      .pipe(timeout(10000))
      .subscribe({
        next: (r) => {
          this.token = r.token;
          this.sessionChecking = false;
          this.loggingIn = false;
          sessionStorage.setItem('nailbar-admin-token', r.token);
          this.password = '';
          this.error = '';
          this.refresh();
        },
        error: (e) => {
          this.loggingIn = false;
          this.error =
            e.name === 'TimeoutError'
              ? 'The API did not respond. Check that the API service is online.'
              : 'Incorrect password.';
          this.refresh();
        },
      });
  }
  logout(): void {
    this.token = '';
    this.error = '';
    this.status = '';
    sessionStorage.removeItem('nailbar-admin-token');
  }
  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.status = 'Saving changes…';
    this.error = '';
    this.site
      .save(this.model, this.token)
      .pipe(timeout(15000))
      .subscribe({
        next: (saved) => {
          this.saving = false;
          this.model = this.merge(saved);
          this.site.content.set(saved);
          this.status = 'Saved — your changes are now live.';
          this.refresh();
        },
        error: (e) => {
          this.saving = false;
          this.status = '';
          if (e.status === 401) {
            this.token = '';
            sessionStorage.removeItem('nailbar-admin-token');
            this.error = 'Your session expired after the server restarted. Please sign in again.';
          } else if (e.name === 'TimeoutError')
            this.error = 'Saving timed out. Check that the API is running, then try again.';
          else
            this.error =
              e.error?.message ||
              e.error?.title ||
              `Changes could not be saved${e.status ? ` (error ${e.status})` : ''}.`;
          this.refresh();
        },
      });
  }
  async upload(key: string, event: Event): Promise<void> {
    const chosen = (event.target as HTMLInputElement).files?.[0];
    if (!chosen) return;
    this.uploading = key;
    this.uploadProgress = 0;
    this.error = '';
    const file = await this.optimizeImage(chosen);
    this.site.upload(file, this.token).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round((100 * event.loaded) / (event.total || event.loaded));
        if (event.type === HttpEventType.Response && event.body) {
          this.model.media[key] = event.body.url;
          this.uploading = '';
          this.openPreviews.add(key);
          this.status =
            chosen.size > file.size
              ? `Upload complete. Image reduced from ${this.fileSize(chosen.size)} to ${this.fileSize(file.size)}.`
              : 'Upload complete. Click “Save & publish” to make it live.';
        }
        this.refresh();
      },
      error: (e) => {
        this.uploading = '';
        this.uploadProgress = 0;
        this.error = e.error?.message || 'Upload failed.';
        this.refresh();
      },
    });
  }
  togglePreview(key: string): void {
    this.openPreviews.has(key) ? this.openPreviews.delete(key) : this.openPreviews.add(key);
  }
  previewOpen(key: string): boolean {
    return this.openPreviews.has(key);
  }
  changePassword(): void {
    this.error = '';
    this.status = '';
    if (this.newPassword.length < 10) {
      this.error = 'The new password must be at least 10 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'The new passwords do not match.';
      return;
    }
    this.changingPassword = true;
    this.site.changePassword(this.currentPassword, this.newPassword, this.token).subscribe({
      next: (result) => {
        this.token = result.token;
        sessionStorage.setItem('nailbar-admin-token', result.token);
        this.currentPassword = this.newPassword = this.confirmPassword = '';
        this.changingPassword = false;
        this.status = 'Password changed. Other signed-in sessions were logged out.';
        this.refresh();
      },
      error: (e) => {
        this.changingPassword = false;
        this.error = e.error?.message || 'Password could not be changed.';
        this.refresh();
      },
    });
  }
  addService(): void {
    this.model.services.push({
      id: crypto.randomUUID(),
      name: { en: 'New service', ka: '', ru: '' },
      description: { en: 'Service description', ka: '', ru: '' },
      price: 0,
    });
  }
  removeService(index: number): void {
    if (confirm('Remove this service?')) this.model.services.splice(index, 1);
  }
  addGalleryItem(): void {
    this.model.gallery.push({
      id: crypto.randomUUID(),
      title: { en: 'New portfolio item', ka: '', ru: '' },
      category: 'manicure',
      imageUrl: '',
      position: '50% 50%',
    });
  }
  removeGalleryItem(index: number): void {
    if (confirm('Remove this portfolio item?')) this.model.gallery.splice(index, 1);
  }
  addLocation(): void {
    this.model.locations.push({
      id: crypto.randomUUID(),
      area: 'New studio',
      address: { en: 'Studio address', ka: '', ru: '' },
      phone: '',
      coordinates: '',
    });
  }
  removeLocation(index: number): void {
    if (confirm('Remove this location?')) this.model.locations.splice(index, 1);
  }
  move<T>(items: T[], index: number, direction: number): void {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
  }
  uploadGallery(item: CmsGalleryItem, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = item.id;
    this.site.upload(file, this.token).subscribe({
      next: (uploadEvent) => {
        if (uploadEvent.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round(
            (100 * uploadEvent.loaded) / (uploadEvent.total || uploadEvent.loaded),
          );
        if (uploadEvent.type === HttpEventType.Response && uploadEvent.body) {
          item.imageUrl = uploadEvent.body.url;
          this.uploading = '';
          this.status = 'Portfolio image uploaded. Save to publish it.';
        }
        this.refresh();
      },
      error: () => {
        this.uploading = '';
        this.error = 'Image upload failed.';
        this.refresh();
      },
    });
  }
  mediaPreview(field: AdminField): string {
    const value = this.model.media[field.key] || field.fallback;
    return value.startsWith('/uploads/') ? this.site.apiUrl + value : value;
  }
  isVideo(field: AdminField): boolean {
    return field.key === 'heroVideo';
  }
  private fileSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  private refresh(): void {
    this.cdr.detectChanges();
  }
  private optimizeImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size < 500_000)
      return Promise.resolve(file);
    return new Promise((resolve) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const scale = Math.min(1, 1920 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(
              blob
                ? new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
                : file,
            );
          },
          'image/webp',
          0.84,
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      image.src = url;
    });
  }
  private makeModel(): SiteContent {
    return {
      translations: {
        en: { ...dictionaries.en },
        ka: { ...dictionaries.ka },
        ru: { ...dictionaries.ru },
      },
      media: {},
      settings: {},
      services: structuredClone(DEFAULT_SERVICES),
      gallery: structuredClone(DEFAULT_GALLERY),
      locations: structuredClone(DEFAULT_LOCATIONS),
    };
  }
  private merge(saved: SiteContent): SiteContent {
    const base = this.makeModel();
    for (const lang of this.languages.map((x) => x.code))
      base.translations[lang] = {
        ...base.translations[lang],
        ...(saved.translations?.[lang] || {}),
      };
    base.media = { ...(saved.media || {}) };
    base.settings = { ...(saved.settings || {}) };
    base.services = saved.services?.length ? saved.services : base.services;
    base.gallery = saved.gallery?.length ? saved.gallery : base.gallery;
    base.locations = saved.locations?.length ? saved.locations : base.locations;
    base.updatedAt = saved.updatedAt;
    return base;
  }
}
