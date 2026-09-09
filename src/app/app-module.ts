import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { About } from './about/about';
import { App } from './app';
import { Booking } from './booking/booking';
import { Gallery } from './gallery/gallery';
import { Locations } from './locations/locations';
import { Main } from './main/main';
import { Navigation } from './navigation/navigation';
import { Services } from './services/services';
import { SiteFooter } from './site-footer/site-footer';

@NgModule({
  declarations: [App, Navigation, Main, Services, Gallery, About, Locations, Booking, SiteFooter],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
