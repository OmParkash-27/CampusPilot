import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { UserList } from './users/user-list/user-list';
import { AddEdit } from './users/add-edit/add-edit';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard', component:Dashboard
  },
  {
    path: 'user-list', component: UserList
  },
  {
    path: 'user-add-edit', component: AddEdit
  },
  {
    path: 'user-add-edit/:id', component: AddEdit
  }
];
