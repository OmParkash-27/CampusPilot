import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminStudentContextService } from '../../../core/services/admin-student-context/admin-student-context.service';

@Injectable({ providedIn: 'root' })
export class ViewDocumentsService {
  private http         = inject(HttpService);
  private authService  = inject(AuthService);
  private adminContext = inject(AdminStudentContextService);

  /**
   * Returns the student record (including photos[]).
   * - Student role: their own record via GET /dashboard/student.
   * - Admin with selected student: that student's record via GET /dashboard/student/:id.
   */
  getStudentRecord(): Observable<any> {
    const user       = this.authService.current_user();
    const selectedId = this.adminContext.selectedStudentId;

    if (user?.role === 'admin' && selectedId) {
      return this.http.get(`dashboard/student/${selectedId}`);
    }
    return this.http.get('dashboard/student');
  }
}
