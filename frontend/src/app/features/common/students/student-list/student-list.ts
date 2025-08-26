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

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, RouterModule, SelectModule, OverlayBadgeModule, BadgeModule, AccordionModule, GalleriaModule, DialogModule],
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
  
  constructor(public router: Router, private studentService: StudentService) {
  }
  
  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.loading.set(true);
    this.studentService.getAllStudents().subscribe({
      next: (data: Student[]) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch students', err);
        this.loading.set(false);
      }
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
