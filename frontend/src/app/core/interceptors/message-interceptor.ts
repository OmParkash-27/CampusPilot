// message.interceptor.ts
import { HttpInterceptorFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const MessageInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);

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
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg
      });
      // Redirect to login if refresh token missing
      if (err.status === 401 && errorMsg === "No refresh token provided") {
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
