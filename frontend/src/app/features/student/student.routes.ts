import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/gaurds/role-guard';
import { AuthGuard } from '../../core/gaurds/auth-guard';
import { adminStudentGuard } from '../../core/gaurds/admin-student-guard';

export const STUDENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'student'], breadcrumb: 'Dashboard' },
    loadComponent: () => import('./dashboard/dashboard').then(m => m.SDashboard)
  },
  {
    // Students upload their own files; admin can also access via the selected-student context.
    path: 'upload-files',
    canActivate: [AuthGuard, RoleGuard, adminStudentGuard],
    data: { roles: ['student', 'admin'], breadcrumb: 'Upload Files' },
    loadComponent: () =>
      import('./upload-student-files/upload-student-files').then(m => m.UploadStudentFiles)
  },
  {
    // Students view their own documents; admin can also access via the selected-student context.
    path: 'view-documents',
    canActivate: [AuthGuard, RoleGuard, adminStudentGuard],
    data: { roles: ['student', 'admin'], breadcrumb: 'View Documents' },
    loadComponent: () =>
      import('./view-documents/view-documents').then(m => m.ViewDocuments)
  }
];
