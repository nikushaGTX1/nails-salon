import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPage } from './category-page/category-page';
import { Gallery } from './gallery/gallery';
import { LoyaltyPage } from './loyalty-page/loyalty-page';
import { Main } from './main/main';
import { Admin } from './admin/admin';

const routes: Routes = [
  { path: 'admin', component: Admin, title: 'Website admin - NAIL BAR 01' },
  { path: '', component: Main, title: 'NAIL BAR 01 — Tbilisi Nail Studio' },
  { path: 'portfolio', component: Gallery, title: 'Portfolio — NAIL BAR 01' },
  { path: 'loyalty', component: LoyaltyPage, title: 'Loyalty — NAIL BAR 01' },
  { path: 'category/:id', component: CategoryPage, title: 'Services — NAIL BAR 01' },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
