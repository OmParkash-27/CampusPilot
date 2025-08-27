import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private commonService: HttpService) {}

  getDashboardData(): Observable<any> {
    return this.commonService.get('dashboard/admin');
  }
}
