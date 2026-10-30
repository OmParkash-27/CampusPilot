import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { RoleGuard } from './core/gaurds/role-guard';
import { AuthGuard } from './core/gaurds/auth-guard';
import { ChangePassword } from './shared/component/change-password/change-password';

export const routes: Routes = [
    {
        path: '', component: MainLayout, children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            {
                path: 'home',
                component: Home,
                data: { breadcrumb: 'Home', hideBreadcrumb: true }
            },
            {
                path: 'login',
                component: Login,
                data: { breadcrumb: 'Login', hideBreadcrumb: true }
            },
            {
                path: 'change-password',
                component: ChangePassword,
                data: { breadcrumb: 'Change Password' }
            },
            {
                path: 'about',
                component: About,
                data: { breadcrumb: 'About', hideBreadcrumb: true }
            },
            {
                path: 'contact',
                component: Contact,
                data: { breadcrumb: 'Contact', hideBreadcrumb: true }
            },
            {
                path: 'admin',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['admin'], breadcrumb: 'Admin' },
                loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
            },
            {
                path: 'editor',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['editor', 'admin'], breadcrumb: 'Editor' },
                loadChildren: () => import('./features/editor/editor.routes').then(m => m.EDITOR_ROUTES)
            },
            {
                path: 'teacher',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['teacher', 'admin'], breadcrumb: 'Teacher' },
                loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
            },
            {
                path: 'student',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['student', 'admin'], breadcrumb: 'Student' },
                loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
            },
            { path: '**', redirectTo: 'home' }
        ]

    },

];
