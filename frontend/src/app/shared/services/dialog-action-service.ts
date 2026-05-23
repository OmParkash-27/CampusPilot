import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogActionService {
  private submitSubject = new Subject<void>();
  submit$ = this.submitSubject.asObservable();

  private logoutAllSubject = new Subject<void>(); 
  logoutAll$ = this.logoutAllSubject.asObservable();

  triggerSubmit() {
    this.submitSubject.next();
  }
  triggerLogoutAll() {
    this.logoutAllSubject.next();
  }
}