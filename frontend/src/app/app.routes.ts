import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { RoleGuard } from './core/gaurds/role-guard';
import { AuthGuard } from './core/gaurds/auth-guard';

export const routes: Routes = [
    {
        path: '', component: MainLayout, children: [
            { path: '', redirectTo: 'home', pathMatch: 'full'},
            { path: 'home', component: Home},
            { path: 'login', component: Login },
            { path: 'about', component: About},
            { path: 'contact', component: Contact},
            {
                path: 'admin',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['admin'] },
                loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
            },
            {
                path: 'editor',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['editor', 'admin'] },
                loadChildren: () => import('./features/editor/editor.routes').then(m => m.EDITOR_ROUTES)
            },
            {
                path: 'teacher',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['teacher', 'admin'] },
                loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
            },
            {
                path: 'student',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['student', 'admin', 'teacher', 'editor'] },
                loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
            },
            {
                path: 'common',
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['student', 'admin', 'teacher', 'editor'] },
                loadChildren: () => import('./features/common/common.routes').then(m => m.COMMON_ROUTES)
            },

            { path: '**', redirectTo: 'home' }
        ]
        
    },

];
