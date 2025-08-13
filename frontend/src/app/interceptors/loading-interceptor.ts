import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { LoadingService } from '../core/services/loading/loading-service';


@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private minShowTime = 3000; // 3 seconds in ms

  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();
    const startTime = Date.now();

    return next.handle(req).pipe(
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = this.minShowTime - elapsed;

        if (remaining > 0) {
          // Wait remaining time before hiding spinner
          timer(remaining).subscribe(() => this.loadingService.hide());
        } else {
          this.loadingService.hide();
        }
      })
    );
  }
}
