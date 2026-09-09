import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Gallery } from './gallery/gallery';
import { Main } from './main/main';

const routes: Routes = [
  { path: '', component: Main, title: 'NAIL BAR 01 — Tbilisi Nail Studio' },
  { path: 'portfolio', component: Gallery, title: 'Portfolio — NAIL BAR 01' },
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
