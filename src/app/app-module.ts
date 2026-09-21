import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { About } from './about/about';
import { App } from './app';
import { AttentionToDetail } from './attention-to-detail/attention-to-detail';
import { Booking } from './booking/booking';
import { CategoryGrid } from './category-grid/category-grid';
import { CategoryPage } from './category-page/category-page';
import { EditableBlock } from './editable-block';
import { EditableCrop } from './editable-crop';
import { EditableField } from './editable-field';
import { EditableImage } from './editable-image';
import { EditableItemImage } from './editable-item-image';
import { EditableText } from './editable-text';
import { EditToolbar } from './edit-toolbar/edit-toolbar';
import { FourHands } from './four-hands/four-hands';
import { Gallery } from './gallery/gallery';
import { GiftCertificate } from './gift-certificate/gift-certificate';
import { Locations } from './locations/locations';
import { Loyalty } from './loyalty/loyalty';
import { LoyaltyPage } from './loyalty-page/loyalty-page';
import { Main } from './main/main';
import { Navigation } from './navigation/navigation';
import { Services } from './services/services';
import { ServicePage } from './service-page/service-page';
import { SiteFooter } from './site-footer/site-footer';
import { Values } from './values/values';
import { Admin } from './admin/admin';

@NgModule({
  declarations: [
    App,
    Navigation,
    Main,
    Services,
    ServicePage,
    CategoryGrid,
    CategoryPage,
    FourHands,
    Gallery,
    GiftCertificate,
    AttentionToDetail,
    About,
    Locations,
    Loyalty,
    LoyaltyPage,
    Booking,
    Values,
    SiteFooter,
    Admin,
    EditableText,
    EditableImage,
    EditableField,
    EditableItemImage,
    EditableCrop,
    EditableBlock,
    EditToolbar,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
