import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { About } from './about/about';
import { App } from './app';
import { Booking } from './booking/booking';
import { Gallery } from './gallery/gallery';
import { Locations } from './locations/locations';
import { Loyalty } from './loyalty/loyalty';
import { LoyaltyPage } from './loyalty-page/loyalty-page';
import { Main } from './main/main';
import { Navigation } from './navigation/navigation';
import { Services } from './services/services';
import { SiteFooter } from './site-footer/site-footer';
import { Admin } from './admin/admin';

@NgModule({
  declarations: [
    App,
    Navigation,
    Main,
    Services,
    Gallery,
    About,
    Locations,
    Loyalty,
    LoyaltyPage,
    Booking,
    SiteFooter,
    Admin,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
