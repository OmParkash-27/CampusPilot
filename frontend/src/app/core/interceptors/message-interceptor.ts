// message.interceptor.ts
import { HttpInterceptorFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const MessageInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse && event.body?.message) {
        messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: event.body.message
        });
      }
    }),
    catchError((err) => {
      const errorMsg = err.error?.message || 'Something went wrong';
      const errorCode = err.error?.code || null;
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg
      });
      // Redirect to login if refresh token missing
      if ((err.status === 401 || err.status === 403) && ['NO_REFRESH_TOKEN', 'INVALID_REFRESH_TOKEN'].includes(errorCode)) {
        // authService.logout().subscribe({
        //   next: () => {
            authService.current_user.set(null);
            router.navigate(['/login']);
        //   },
        //   error: err => console.error('Logout failed:', err)
        // });
      }
      return throwError(() => err);
    })
  );
};
