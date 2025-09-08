import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private httpService: HttpService) {}

  getDashboardData(): Observable<any> {
    return this.httpService.get('dashboard/student');
  }
}
