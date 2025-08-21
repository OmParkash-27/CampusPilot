import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard', component:Dashboard
  },
{
  path: 'user-list',
  loadComponent: () => import('./users/user-list/user-list').then(m => m.UserList)
},
{
  path: 'user-add-edit',
  loadComponent: () => import('./users/add-edit/add-edit').then(m => m.AddEdit)
},
{
  path: 'user-add-edit/:id',
  loadComponent: () => import('./users/add-edit/add-edit').then(m => m.AddEdit)
},

];
