import { Routes } from '@angular/router';

export const TEACHER_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.TDashboard),
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'common',
    data: { breadcrumb: null },   // transparent segment — skipped in breadcrumb trail
    loadChildren: () => import('../common/common.routes').then(m => m.COMMON_ROUTES)
  }
];
