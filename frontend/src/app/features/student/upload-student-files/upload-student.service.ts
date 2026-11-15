import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminStudentContextService } from '../../../core/services/admin-student-context/admin-student-context.service';

@Injectable({ providedIn: 'root' })
export class UploadFilesService {
  private httpService  = inject(HttpService);
  private authService  = inject(AuthService);
  private adminContext = inject(AdminStudentContextService);

  /**
   * Returns the student record for the upload page.
   * - Student role: their own record (GET /dashboard/student).
   * - Admin with selected student: that student's record (GET /dashboard/student/:id).
   */
  getUploadedFiles(): Observable<any> {
    const user       = this.authService.current_user();
    const selectedId = this.adminContext.selectedStudentId;

    if (user?.role === 'admin' && selectedId) {
      return this.httpService.get(`dashboard/student/${selectedId}`);
    }
    return this.httpService.get('dashboard/student');
  }

  /**
   * Uploads documents.
   * - Student role: uploads to their own account (PUT /students — uses req.user.id on backend).
   * - Admin with selected student: uploads to the selected student's account via their Student _id
   *   (PUT /students/:studentId — backend validates admin role + student existence).
   *
   * Note: the backend's uploadDocuments uses req.user.id (student only), so for admin
   * we need to call a student-specific PUT /students/:id endpoint.  The existing
   * updateStudent route (isEditor — admin qualifies) handles file uploads via PUT /:id,
   * so we reuse that for the admin case with FormData photos only.
   */
  uploadDocs(formData: FormData): Observable<any> {
    const user       = this.authService.current_user();
    const selectedId = this.adminContext.selectedStudentId;

    if (user?.role === 'admin' && selectedId) {
      // Use PUT /students/:id — admin/editor have access to this route
      return this.httpService.put(formData, 'students', selectedId);
    }
    // Student self-upload: PUT /students (no ID — backend uses req.user.id)
    return this.httpService.putWithoutId(formData, 'students');
  }
}
