import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Request_For, API, User } from './auth.const';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = environment.apiUrl;
  current_user: WritableSignal<User | null> = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL + '/' + Request_For.AUTH + '/' + API.LOGIN}`, { email, password }, { withCredentials: true });
  }

  register(formData: FormData ): Observable<any> {
    return this.http.post(`${this.API_URL + '/' + Request_For.AUTH + '/' + API.REGISTER}`, formData, { withCredentials: true });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL + '/' + Request_For.AUTH + '/' + API.PROFILE}`, { withCredentials: true });
  }

  // load user by angular app_initilizer and convert observable(coming from getProfile) in promise, bcos app_initilizer only know promise
  loadCurrentUser() {
    return this.getProfile().pipe(
      tap(user => this.current_user.set(user)),
      catchError(() => {
        this.current_user.set(null);
        return of(null);
      })
    ).toPromise();
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL + '/' + Request_For.AUTH + '/' + API.LOGOUT}`, {}, { withCredentials: true });
  }
}
