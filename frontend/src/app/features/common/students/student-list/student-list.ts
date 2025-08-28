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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, TableModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, FormsModule, RouterModule, SelectModule, OverlayBadgeModule, BadgeModule, AccordionModule, GalleriaModule, DialogModule],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList {
  API_URL = environment.apiUrl;
  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Student', value: 'student' },
    { label: 'Editor', value: 'editor' },
    { label: 'Teacher', value: 'teacher' }
  ];
  loading = signal<boolean>(true);
  students = signal<Student[]>([]);

  showAddressDialog = false;
  selectedAddress: any = null;

  showPhotosDialog = false;
  selectedPhotos: string[] = [];

  showCoursesDialog = false;
  selectedCourses: any[] = [];
  loggedUserRole: string| undefined= '';

  searchTerm: string = '';
  filteredStudents: Student[] = [];
  
  constructor(public router: Router, private studentService: StudentService, private authService: AuthService) {
    const user = this.authService.current_user();
    this.loggedUserRole = user?.role;
  }
  
  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.loading.set(true);
    this.studentService.getAllStudents().subscribe({
      next: (data: Student[]) => {
        this.students.set(data);
        this.filteredStudents = this.students();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch students', err);
        this.loading.set(false);
      }
    });
  }

  // Filtering logic
filterStudents() {
  const term = this.searchTerm.trim().toLowerCase();
  if (!term) {
    this.filteredStudents = this.students();
    return;
  }

  // multiple words split
  const keywords = term.split(/\s+/);

    this.filteredStudents = this.students().filter(student => {
      // fields to search in
      const haystack = [
        student?.user?.name,
        student?.user?.email,
        student?.user?.role,
        student?.phone,
        student?.guardianName,
        student?.guardianContact,
        student?.gender,
        ...(student?.courses?.map((c: any) => c.course) || []),
        ...(student?.courses?.map((c: any) => c.batchYear?.toString()) || []),
        ...(student?.courses?.map((c: any) => c.status) || [])
      ].join(' ').toLowerCase();

      // check if *all keywords* exist
      return keywords.every(k => haystack.includes(k));
    });
  }

  viewAddress(address: any) {
    this.selectedAddress = address;
    this.showAddressDialog = true;
  }

  viewPhotos(photos: string[]) {
    this.selectedPhotos = photos;
    this.showPhotosDialog = true;
  }

  viewCourses(courses: any[]) {
    this.selectedCourses = courses;
    this.showCoursesDialog = true;
  }

  navigate(id: string) {
    this.router.navigate(['common/student-add-edit/edit',id]);
  }

  deleteStudent(id: string) {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        // Remove deleted student from local state
        this.students.set(this.students().filter(s => s._id !== id));
      },
      error: (err) => {
        console.error('Failed to delete student', err);
      }
    });
  }
}
