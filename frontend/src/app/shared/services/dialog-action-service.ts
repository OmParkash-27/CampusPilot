import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogActionService {
  private submitSubject = new Subject<void>();

  submit$ = this.submitSubject.asObservable();

  triggerSubmit() {
    this.submitSubject.next();
  }
}