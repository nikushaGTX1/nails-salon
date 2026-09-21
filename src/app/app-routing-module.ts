import { NgModule, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router, RouterModule, Routes } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { SiteContentService } from './site-content.service';
import { CategoryPage } from './category-page/category-page';
import { Gallery } from './gallery/gallery';
import { LoyaltyPage } from './loyalty-page/loyalty-page';
import { Main } from './main/main';
import { Admin } from './admin/admin';
import { ServicePage } from './service-page/service-page';

const portfolioEnabled: CanActivateFn = () => {
  const site = inject(SiteContentService);
  const router = inject(Router);
  return toObservable(site.loaded).pipe(
    filter(Boolean),
    take(1),
    map(() => site.portfolioVisible() || router.parseUrl('/')),
  );
};

const routes: Routes = [
  { path: 'admin', component: Admin, title: 'Website admin - NAIL BAR 01' },
  { path: '', component: Main, title: 'NAIL BAR 01 — Tbilisi Nail Studio' },
  { path: 'portfolio', component: Gallery, canActivate: [portfolioEnabled], title: 'Portfolio — NAIL BAR 01' },
  { path: 'loyalty', component: LoyaltyPage, title: 'Loyalty — NAIL BAR 01' },
  { path: 'category/:id', component: CategoryPage, title: 'Services — NAIL BAR 01' },
  { path: 'service/:id', component: ServicePage, title: 'Service — NAIL BAR 01' },
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
