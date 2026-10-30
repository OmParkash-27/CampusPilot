import { Routes } from "@angular/router";
import { AuthGuard } from "../../core/gaurds/auth-guard";
import { RoleGuard } from "../../core/gaurds/role-guard";

export const COMMON_ROUTES: Routes = [
    {
        path: 'student-list',
        loadComponent: () => import('../common/students/student-list/student-list').then(m => m.StudentList),
        data: { breadcrumb: 'Students' }
    },
    {
        path: 'student-new-register-list',
        loadComponent: () => import('./students/new-register-student-list/new-register-student-list').then(m => m.NewRegisterStudent),
        data: { breadcrumb: 'New Registrations' }
    },
    {
        path: 'student-add-edit',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent),
        data: { breadcrumb: 'Add Student' }
    },
    {
        path: 'student-add-edit/add-details/:userId',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent),
        data: { breadcrumb: 'Student Details' }
    },
    {
        path: 'student-add-edit/edit/:studentId',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['admin', 'editor'], breadcrumb: 'Edit Student' },
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent)
    },
];
