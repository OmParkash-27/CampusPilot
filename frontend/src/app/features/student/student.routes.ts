import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/gaurds/role-guard';
import { AuthGuard } from '../../core/gaurds/auth-guard';

export const STUDENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'student'] },
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.SDashboard)
  },
  {
    path: 'upload-files',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
    loadComponent: () =>
      import('./upload-student-files/upload-student-files').then(m => m.UploadStudentFiles)
  }
];
