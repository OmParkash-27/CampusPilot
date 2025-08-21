import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';
import { Student } from '../../../core/models/Student';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private model = 'students';
  
  constructor(private http: HttpService) {}

  getAll(): Observable<Student[]> {
    return this.http.getAll(this.model);
  }

  getById(id: string): Observable<Student> {
    return this.http.getById(this.model, id);
  }

  create(formData: FormData): Observable<Student> {
    return this.http.post(formData, this.model);
  }

  update(formData: FormData, id: string): Observable<Student> {
    return this.http.put(formData, this.model, id);
  }

  delete(id: string): Observable<any> {
    return this.http.deleteById(this.model, id);
  }

  updateStatus(userId: string, status: boolean): Observable<any> {
    const fd = new FormData();
    fd.append('status', status ? 'true' : 'false');
    return this.http.put(fd, 'users', userId, '/update-status'); // updates status in linked user
  }
}
