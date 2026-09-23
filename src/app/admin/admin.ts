import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { EditModeService } from '../edit-mode.service';
import { dictionaries, Language } from '../translation.service';
import {
  BookingRecord,
  CmsCategory,
  CmsGalleryItem,
  CmsLocation,
  CmsService,
  DEFAULT_GALLERY,
  DEFAULT_LOCATIONS,
  DEFAULT_SERVICES,
  DEFAULT_SUB_SERVICES,
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
  dirty = false;
  loggingIn = false;
  error = '';
  status = '';
  conflict = false;
  activeLanguage: Language = 'en';
  uploading = '';
  uploadProgress = 0;
  search = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;
  bookings: BookingRecord[] = [];
  bookingsLoading = false;
  deletingBooking = 0;
  updatingBooking = 0;
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
        'reviews',
        'locations',
        'loyalty',
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
      id: 'gift',
      title: 'Gift certificate section',
      description: 'Homepage section offering a gift certificate, with a phone call-to-action.',
      keys: ['giftCert', 'giftCertTitle', 'giftCertText', 'giftCertCta', 'giftCertVisualLabel'],
    },
    {
      id: 'attention',
      title: 'Attention to detail section',
      description: 'Sterilization and guarantee information shown on the homepage.',
      keys: [
        'attention',
        'attentionTitle',
        'attentionText',
        'sterilizationTitle',
        'sterilizationText',
        'guaranteeTitle',
        'guaranteeText',
      ],
    },
    {
      id: 'reviews',
      title: 'Reviews section',
      description:
        'Ratings and client reviews shown on the homepage (replaces the old About section). Review text below is demo data — replace with real client reviews.',
      keys: [
        'reviews',
        'reviewsTitle',
        'reviewsText',
        'reviewsRatingLabel',
        'reviewsDemoBadge',
        'review1Name',
        'review1Text',
        'review2Name',
        'review2Text',
        'review3Name',
        'review3Text',
      ],
    },
    {
      id: 'locations',
      title: 'Locations section',
      description:
        'Section heading and opening information. Manage studios under “Services & lists”.',
      keys: ['ourLocations', 'locationsTitle', 'locationsText', 'daily'],
    },
    {
      id: 'loyalty',
      title: 'Loyalty program section',
      description:
        'Cashback section on the homepage and the dedicated /loyalty page. Rates are numbers under “Business details”.',
      keys: [
        'loyalty',
        'loyaltyLabel',
        'loyaltyTitle',
        'loyaltyText',
        'loyaltyCashback',
        'loyaltyCashbackText',
        'loyaltyBirthday',
        'loyaltyBirthdayText',
        'loyaltyBalanceLabel',
        'loyaltyExample',
        'loyaltyJoin',
        'loyaltyBookEarn',
        'loyaltyLearn',
        'loyaltyStep1t',
        'loyaltyStep1d',
        'loyaltyStep2t',
        'loyaltyStep2d',
        'loyaltyStep3t',
        'loyaltyStep3d',
        'loyaltyHistory',
        'loyaltyDate',
        'loyaltyService',
        'loyaltyPaid',
        'loyaltyEarned',
        'loyaltyBirthdayBadge',
        'loyaltyPageTitle',
        'loyaltyPageText',
        'loyaltyBackendNote',
      ],
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
      id: 'values',
      title: 'Our values section',
      description: 'Three value cards just above the footer.',
      keys: ['valuesTitle', 'value1Title', 'value1Text', 'value2Title', 'value2Text', 'value3Title', 'value3Text'],
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
    locations: 'Menu — Locations',
    loyalty: 'Menu — Loyalty',
    loyaltyLabel: 'Loyalty — Small section label',
    loyaltyTitle: 'Loyalty — Headline',
    loyaltyText: 'Loyalty — Introduction',
    loyaltyCashback: 'Loyalty — 3% card title',
    loyaltyCashbackText: 'Loyalty — 3% card text',
    loyaltyBirthday: 'Loyalty — Birthday card title',
    loyaltyBirthdayText: 'Loyalty — Birthday card text',
    loyaltyBalanceLabel: 'Loyalty — Balance label',
    loyaltyExample: 'Loyalty — Example badge',
    loyaltyJoin: 'Loyalty — Join button',
    loyaltyBookEarn: 'Loyalty — Book & earn button',
    loyaltyLearn: 'Loyalty — Learn more button',
    loyaltyStep1t: 'Loyalty page — Step 1 title',
    loyaltyStep1d: 'Loyalty page — Step 1 text',
    loyaltyStep2t: 'Loyalty page — Step 2 title',
    loyaltyStep2d: 'Loyalty page — Step 2 text',
    loyaltyStep3t: 'Loyalty page — Step 3 title',
    loyaltyStep3d: 'Loyalty page — Step 3 text',
    loyaltyHistory: 'Loyalty page — History title',
    loyaltyDate: 'Loyalty page — Date column',
    loyaltyService: 'Loyalty page — Service column',
    loyaltyPaid: 'Loyalty page — Paid column',
    loyaltyEarned: 'Loyalty page — Cashback column',
    loyaltyBirthdayBadge: 'Loyalty page — Birthday badge',
    loyaltyPageTitle: 'Loyalty page — Headline',
    loyaltyPageText: 'Loyalty page — Introduction',
    loyaltyBackendNote: 'Loyalty page — Backend note',
    book: 'Booking button',
    online: 'Floating booking button',
    explore: 'Explore services label',
    viewPortfolio: 'View portfolio button',
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
    giftCert: 'Small section label',
    giftCertTitle: 'Gift certificate headline',
    giftCertText: 'Gift certificate paragraph',
    giftCertCta: 'Order button',
    giftCertVisualLabel: 'Certificate card label',
    attention: 'Small section label',
    attentionTitle: 'Attention to detail headline',
    attentionText: 'Attention to detail introduction',
    sterilizationTitle: 'Sterilization — title',
    sterilizationText: 'Sterilization — text',
    guaranteeTitle: 'Guarantee — title',
    guaranteeText: 'Guarantee — text',
    reviews: 'Menu — Reviews / small section label',
    reviewsTitle: 'Reviews headline',
    reviewsText: 'Reviews introduction',
    reviewsRatingLabel: 'Rating label',
    reviewsDemoBadge: 'Demo badge text',
    review1Name: 'Review 1 — Name (demo)',
    review1Text: 'Review 1 — Text (demo)',
    review2Name: 'Review 2 — Name (demo)',
    review2Text: 'Review 2 — Text (demo)',
    review3Name: 'Review 3 — Name (demo)',
    review3Text: 'Review 3 — Text (demo)',
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
      hint:
        'Large moving background at the top of the homepage. MP4, WebM, MOV — any video file. ' +
        'MP4 is safest: some browsers (Chrome, Firefox) cannot play MOV, so if the video appears ' +
        'blank for visitors after uploading a MOV, convert it to MP4 and upload that instead.',
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
    {
      key: 'giftCertImage',
      label: 'Gift certificate photo',
      fallback: '/assets/hero.png',
      hint: 'Photo beside the gift certificate card on the homepage.',
    },
    {
      key: 'fourHandsImage',
      label: '"Service for four hands" photo',
      fallback: '/assets/hero-editorial.png',
      hint: 'Large banner photo in the Services section.',
    },
    {
      key: 'value1Image',
      label: 'Our values — card 1 photo',
      fallback: '/assets/services/signature-manicure.png',
      hint: 'First of the three photo cards near the footer.',
    },
    {
      key: 'value2Image',
      label: 'Our values — card 2 photo',
      fallback: '/assets/hero.png',
      hint: 'Second of the three photo cards near the footer.',
    },
    {
      key: 'value3Image',
      label: 'Our values — card 3 photo',
      fallback: '/assets/studio-interior.png',
      hint: 'Third of the three photo cards near the footer.',
    },
  ];
  readonly settingFields: AdminField[] = [
    {
      key: 'heroTitleWidth',
      label: 'Homepage headline — max width',
      fallback: '',
      hint: 'Number only, as % of screen width, e.g. 45 for a narrower headline that wraps sooner. Leave blank for full width.',
    },
    {
      key: 'loyaltyStandardRate',
      label: 'Loyalty — standard cashback %',
      fallback: '3',
      hint: 'Number only, e.g. 3. Shown on the loyalty card pill.',
    },
    {
      key: 'loyaltyBirthdayRate',
      label: 'Loyalty — birthday cashback %',
      fallback: '40',
      hint: 'Number only, e.g. 40. Shown on the birthday card pill.',
    },
    {
      key: 'loyaltyExampleBalance',
      label: 'Loyalty — example balance',
      fallback: '24.50',
      hint: 'Number only. Preview balance shown in the wallet card.',
    },
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
    private readonly editMode: EditModeService,
    private readonly router: Router,
  ) {
    if (this.token)
      this.site.validateSession(this.token).subscribe({
        next: () => {
          this.sessionChecking = false;
          this.error = '';
          this.loadBookings();
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
  @HostListener('window:beforeunload', ['$event'])
  warnUnsavedChanges(event: BeforeUnloadEvent): void {
    if (!this.dirty || this.saving) return;
    event.preventDefault();
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
          this.loadBookings();
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
  editLive(): void {
    if (this.dirty && !confirm('You have unsaved changes here. Leave without saving them?'))
      return;
    if (this.editMode.enter()) this.router.navigateByUrl('/');
  }
  loadBookings(): void {
    if (!this.token || this.bookingsLoading) return;
    this.bookingsLoading = true;
    this.site.bookings(this.token).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.bookingsLoading = false;
        this.refresh();
      },
      error: () => {
        this.bookingsLoading = false;
        this.error = 'Bookings could not be loaded.';
        this.refresh();
      },
    });
  }
  bookingStudio(booking: BookingRecord): string {
    const location = this.model.locations.find((x) => x.id === booking.studioId);
    return location?.area || booking.studio;
  }
  bookingService(booking: BookingRecord): string {
    const service = this.model.services.find((x) => x.id === booking.serviceId);
    return service
      ? this.site.localized(service.name, this.activeLanguage, booking.service)
      : booking.service;
  }
  deleteBooking(booking: BookingRecord): void {
    if (!confirm(`Delete the booking for ${booking.name}?`)) return;
    this.deletingBooking = booking.id;
    this.site.deleteBooking(booking.id, this.token).subscribe({
      next: () => {
        this.bookings = this.bookings.filter((x) => x.id !== booking.id);
        this.deletingBooking = 0;
        this.status = 'Booking deleted.';
        this.refresh();
      },
      error: () => {
        this.deletingBooking = 0;
        this.error = 'The booking could not be deleted.';
        this.refresh();
      },
    });
  }
  updateBookingStatus(booking: BookingRecord, status: BookingRecord['status']): void {
    const previous = booking.status;
    booking.status = status;
    this.updatingBooking = booking.id;
    this.site.updateBookingStatus(booking.id, status, this.token).subscribe({
      next: () => {
        this.updatingBooking = 0;
        this.status = 'Booking status updated.';
        this.refresh();
      },
      error: () => {
        booking.status = previous;
        this.updatingBooking = 0;
        this.error = 'The booking status could not be updated.';
        this.refresh();
      },
    });
  }
  /**
   * Before writing, checks whether someone else (another tab, device, or a session left open
   * for a while) has published a newer version since this page loaded its data. Without this,
   * saving here would silently overwrite their changes — including translation edits — with
   * whatever this tab last loaded, which is exactly what happened when a client's Russian text
   * edit "reset to how it was previously".
   */
  save(force = false): void {
    if (this.saving) return;
    this.saving = true;
    this.status = force ? 'Saving over the newer version…' : 'Checking for newer changes…';
    this.error = '';
    this.conflict = false;
    this.site
      .fetchLatest()
      .pipe(timeout(15000))
      .subscribe({
        next: (latest) => {
          const conflict =
            !force && this.model.updatedAt && latest.updatedAt !== this.model.updatedAt;
          if (conflict) {
            this.saving = false;
            this.status = '';
            this.conflict = true;
            this.error =
              'Someone else published changes after this page loaded (maybe another tab or device). ' +
              'Saving now would overwrite them. Click “Save anyway” to overwrite, or reload the page first to see the latest version and redo your edit there.';
            this.refresh();
            return;
          }
          this.writeChanges(force);
        },
        error: () => {
          // Could not confirm the latest version (e.g. offline) — fall back to a direct save.
          // The server enforces the same conflict check independently, so this never bypasses it.
          this.writeChanges(force);
        },
      });
  }
  /** Save-anyway after a conflict warning: publishes this tab's version regardless of what else was saved meanwhile. */
  saveAnyway(): void {
    this.saving = false;
    this.save(true);
  }
  private writeChanges(force: boolean): void {
    this.status = 'Saving changes…';
    this.site
      .save(this.model, this.token, force)
      .pipe(timeout(15000))
      .subscribe({
        next: (saved) => {
          this.saving = false;
          this.dirty = false;
          this.conflict = false;
          this.model = this.merge(saved);
          this.site.content.set(saved);
          this.site.primeCache(saved);
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
          } else if (e.status === 409) {
            // The server's own guard caught what our pre-check missed (e.g. another save landed
            // in the gap between the check and this write) — same conflict, same recovery.
            this.conflict = true;
            this.error =
              e.error?.message ||
              'Someone else published changes just now. Click “Save anyway” to overwrite, or reload the page first.';
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
  get portfolioOn(): boolean {
    return this.model.settings['showPortfolio'] === '1';
  }
  set portfolioOn(value: boolean) {
    this.model.settings['showPortfolio'] = value ? '1' : '0';
  }
  subServicesText(serviceId: string): string {
    const saved = this.model.settings['sub:' + serviceId + ':' + this.activeLanguage];
    if (saved !== undefined) return saved;
    return (DEFAULT_SUB_SERVICES[serviceId]?.[this.activeLanguage] ?? []).join('\n');
  }
  addService(): void {
    this.model.services.push({
      id: crypto.randomUUID(),
      name: { en: 'New service', ka: '', ru: '' },
      description: { en: 'Service description', ka: '', ru: '' },
      price: 0,
      categoryId: '',
      groupLabel: {},
      subgroupLabel: {},
      imageUrl: '',
    });
  }
  removeService(index: number): void {
    if (confirm('Remove this service?')) this.model.services.splice(index, 1);
  }
  addCategory(): void {
    this.model.categories.push({
      id: crypto.randomUUID(),
      name: { en: 'New category', ka: '', ru: '' },
      imageUrl: '',
    });
  }
  removeCategory(index: number): void {
    if (confirm('Remove this category?')) this.model.categories.splice(index, 1);
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
  async uploadGallery(item: CmsGalleryItem, event: Event): Promise<void> {
    const chosen = (event.target as HTMLInputElement).files?.[0];
    if (!chosen) return;
    this.uploading = item.id;
    this.error = '';
    const file = await this.optimizeImage(chosen);
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
      error: (e) => {
        this.uploading = '';
        this.error = e.error?.message || 'Image upload failed.';
        this.refresh();
      },
    });
  }
  async uploadCategoryImage(category: CmsCategory, event: Event): Promise<void> {
    const chosen = (event.target as HTMLInputElement).files?.[0];
    if (!chosen) return;
    this.uploading = category.id;
    this.error = '';
    const file = await this.optimizeImage(chosen);
    this.site.upload(file, this.token).subscribe({
      next: (uploadEvent) => {
        if (uploadEvent.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round(
            (100 * uploadEvent.loaded) / (uploadEvent.total || uploadEvent.loaded),
          );
        if (uploadEvent.type === HttpEventType.Response && uploadEvent.body) {
          category.imageUrl = uploadEvent.body.url;
          this.uploading = '';
          this.status = 'Category image uploaded. Save to publish it.';
        }
        this.refresh();
      },
      error: (e) => {
        this.uploading = '';
        this.error = e.error?.message || 'Image upload failed.';
        this.refresh();
      },
    });
  }
  async uploadServiceImage(service: CmsService, event: Event): Promise<void> {
    const chosen = (event.target as HTMLInputElement).files?.[0];
    if (!chosen) return;
    this.uploading = service.id;
    this.error = '';
    const file = await this.optimizeImage(chosen);
    this.site.upload(file, this.token).subscribe({
      next: (uploadEvent) => {
        if (uploadEvent.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round(
            (100 * uploadEvent.loaded) / (uploadEvent.total || uploadEvent.loaded),
          );
        if (uploadEvent.type === HttpEventType.Response && uploadEvent.body) {
          service.imageUrl = uploadEvent.body.url;
          this.uploading = '';
          this.status = 'Service image uploaded. Save to publish it.';
        }
        this.refresh();
      },
      error: (e) => {
        this.uploading = '';
        this.error = e.error?.message || 'Image upload failed.';
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
    // Safari sometimes reports no/blank type for HEIC photos straight off an iPhone, so an image
    // extension counts too — if the browser genuinely can't decode it, image.onerror below just
    // falls back to the original file rather than breaking the upload.
    const looksLikeImage =
      file.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp|avif)$/i.test(file.name);
    if (!looksLikeImage || file.type === 'image/gif' || file.size < 500_000)
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
  /** structuredClone is unavailable on older Safari (pre-15.4); fall back to a JSON clone rather than crashing the whole admin panel. */
  private clone<T>(value: T): T {
    try {
      return structuredClone(value);
    } catch {
      return JSON.parse(JSON.stringify(value));
    }
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
      services: this.clone(DEFAULT_SERVICES),
      gallery: this.clone(DEFAULT_GALLERY),
      locations: this.clone(DEFAULT_LOCATIONS),
      categories: [],
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
    base.categories = saved.categories?.length ? saved.categories : base.categories;
    base.updatedAt = saved.updatedAt;
    return base;
  }
}
