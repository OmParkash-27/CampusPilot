import { Routes } from "@angular/router"

export const COMMON_ROUTES:Routes = [
    {
        path: 'student-list',
        loadComponent: () => import('../common/students/student-list/student-list').then(m => m.StudentList)
    },
    {
        path: 'student-new-register-list',
        loadComponent: () => import('./students/new-register-student-list/new-register-student-list').then(m => m.NewRegisterStudent)
    },
    {
        path: 'student-add-edit',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent)
    },
    {
        path: 'student-add-edit/add-details/:userId',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent)
    },
    {
        path: 'student-add-edit/edit/:studentId',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent)
    },
    
]