import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: Dashboard,
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'user-list',
    loadComponent: () => import('./users/user-list/user-list').then(m => m.UserList),
    data: { breadcrumb: 'Users' }
  },
  {
    path: 'user-add-edit',
    loadComponent: () => import('./users/add-edit/add-edit').then(m => m.AddEdit),
    data: { breadcrumb: 'Add User' }
  },
  {
    path: 'user-add-edit/:id',
    loadComponent: () => import('./users/add-edit/add-edit').then(m => m.AddEdit),
    data: { breadcrumb: 'Edit User' }
  },
  {
    path: 'common',
    data: { breadcrumb: null },   // transparent segment — skipped in breadcrumb trail
    loadChildren: () => import('../common/common.routes').then(m => m.COMMON_ROUTES)
  }
];
