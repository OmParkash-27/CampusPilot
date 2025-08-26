import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';
import { User } from '../../../core/models/User';
import { AuthService } from '../../../core/services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private model = 'users';
  currentUser: User | null;
  private authService = inject(AuthService)
  
  constructor(private http: HttpService) {
    this.currentUser = this.authService.current_user()
  }
  getAll(): Observable<User[]> {
    return this.http.getAll(this.model);
  }

  getUserById(id: string): Observable<User> {
    return this.http.getById(this.model, id);
  }

  create(formData: FormData): Observable<User> {
    return this.http.post(formData, this.model);
  }

  update(formData: FormData, id: string): Observable<User> {
    return this.http.put(formData, this.model, id);
  }

  delete(id: string): Observable<any> {
    return this.http.deleteById(this.model, id);
  }

  updateRole(id: string, role: User['role']): Observable<User> {
    const fd = new FormData();
    fd.append('role', role);
    return this.http.put(fd, this.model, id, '/update-role');
  }

  updateStatus(id: string, status: boolean): Observable<User> {
    const fd = new FormData();
    fd.append('status', status ? 'true' : 'false');
    return this.http.put(fd, this.model, id, '/update-status');
  }
}
