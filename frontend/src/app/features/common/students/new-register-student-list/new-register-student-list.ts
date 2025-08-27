import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { environment } from '../../../../../environments/environment';
import { StudentService } from '../student.service';
import { AccordionModule } from 'primeng/accordion';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { Student } from '../../../../core/models/Student';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { User } from '../../../../core/models/User';

@Component({
  selector: 'app-new-register-student',
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, RouterModule, SelectModule, OverlayBadgeModule, BadgeModule, AccordionModule, GalleriaModule, DialogModule],
  templateUrl: './new-register-student-list.html',
  styleUrl: './new-register-student-list.scss'
})
export class NewRegisterStudent {
  API_URL = environment.apiUrl;
  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Student', value: 'student' },
    { label: 'Editor', value: 'editor' },
    { label: 'Teacher', value: 'teacher' }
  ];
  loading = signal<boolean>(true);
  students = signal<User[]>([]);

  selectedAddress: any = null;

  selectedPhotos: string[] = [];

  selectedCourses: any[] = [];
  loggedUserRole: string| undefined= '';
  
  constructor(public router: Router, private studentService: StudentService, private authService: AuthService) {
    const user = this.authService.current_user();
    this.loggedUserRole = user?.role;
  }
  
  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.loading.set(true);
    this.studentService.getNewRegisteredStudent().subscribe({
      next: (data: User[]) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch students', err);
        this.loading.set(false);
      }
    });
  }

  navigate(id: string) {
    this.router.navigate(['common/student-add-edit/add-details',id]);
  }


}
