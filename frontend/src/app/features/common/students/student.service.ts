// src/app/services/student.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../../../core/models/Student';
import { HttpService } from '../../../core/services/common/http.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private http = inject(HttpService);

  model:string = 'students';

  // Get all students
  getAllStudents() {
    return this.http.getAll(this.model);
  }

  // Get single student by ID
  getStudentById(id: string): Observable<Student> {
    return this.http.getById(this.model, id);
  }

  // Create student
  createStudent(student: FormData): Observable<Student> { 
    return this.http.post(student, this.model);
  }

  // Update student
  updateStudent(id: string, student: FormData): Observable<Student> {
    return this.http.put(student, this.model, id);
  }

  // Delete student
  deleteStudent(id: string): Observable<any> {
    return this.http.deleteById(this.model, id);
  }

  // Get all newly registered users (role: student, but not yet in Student collection)
  // getNewRegisteredStudents(): Observable<User[]> {
  //   return this.http.getAll();
  // }
}
