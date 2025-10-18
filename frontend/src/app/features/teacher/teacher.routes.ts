import { Routes } from '@angular/router';

export const TEACHER_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.TDashboard)
  },
  {
    path: 'common',
    loadChildren: () => import('../common/common.routes').then(m => m.COMMON_ROUTES)
  }
];
