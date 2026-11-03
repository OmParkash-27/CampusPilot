import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';

/**
 * Thin service for the View Documents page.
 * Reuses the same dashboard/student endpoint that already returns
 * the full Student record (including photos[]) for the logged-in student.
 * Authentication is handled by the cookie-based JWT — students can only
 * ever retrieve their own record.
 */
@Injectable({ providedIn: 'root' })
export class ViewDocumentsService {
  constructor(private http: HttpService) {}

  /** Returns the full Student record, including the photos[] Cloudinary URL array. */
  getStudentRecord(): Observable<any> {
    return this.http.get('dashboard/student');
  }
}
