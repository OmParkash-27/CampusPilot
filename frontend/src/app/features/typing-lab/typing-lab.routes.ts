
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/gaurds/auth-guard';

export const TYPING_LAB_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./typing-practice/typing-practice')
        .then(m => m.TypingPracticeComponent),
    data: {
      breadcrumb: 'Typing Lab'
    }
  }
];
