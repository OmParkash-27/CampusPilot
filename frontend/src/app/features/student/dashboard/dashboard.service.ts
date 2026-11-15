import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminStudentContextService } from '../../../core/services/admin-student-context/admin-student-context.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private httpService = inject(HttpService);
  private authService = inject(AuthService);
  private adminContext = inject(AdminStudentContextService);

  /**
   * Returns the correct student dashboard data:
   * - Student role: their own record via GET /dashboard/student
   * - Admin role with a selected student: that student's record via GET /dashboard/student/:id
   */
  getDashboardData(): Observable<any> {
    const user = this.authService.current_user();
    const selectedId = this.adminContext.selectedStudentId;

    if (user?.role === 'admin' && selectedId) {
      return this.httpService.get(`dashboard/student/${selectedId}`);
    }
    // Default: logged-in student sees their own data
    return this.httpService.get('dashboard/student');
  }
}
