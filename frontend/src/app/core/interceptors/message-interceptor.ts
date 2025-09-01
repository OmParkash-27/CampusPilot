// message.interceptor.ts
import { HttpInterceptorFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const MessageInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

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
      return throwError(() => err);
    })
  );
};
