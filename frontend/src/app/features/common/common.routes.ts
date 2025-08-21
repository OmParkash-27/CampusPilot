import { Routes } from "@angular/router"

export const COMMON_ROUTES:Routes = [
    {
        path: 'student-list',
        loadComponent: () => import('../common/students/student-list/student-list').then(m => m.StudentList)
    },
    {
        path: 'student-add-edit',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent)
    },
    {
        path: 'student-add-edit/:id',
        loadComponent: () => import('../common/students/student-add-edit/student-add-edit').then(m => m.AddEditStudent)
    },
]