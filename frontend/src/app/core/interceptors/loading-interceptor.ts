import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading/loading-service';
import { finalize } from 'rxjs/operators';
import { timer } from 'rxjs';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const minShowTime = 2000;
  const startTime = Date.now();

  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      const elapsed = Date.now() - startTime;
      const remaining = minShowTime - elapsed;
      if (remaining > 0) {
        timer(remaining).subscribe(() => loadingService.hide());
      } else {
        loadingService.hide();
      }
    })
  );
};
