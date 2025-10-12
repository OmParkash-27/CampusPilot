import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, ReorderableColumn } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { StudentService } from '../student.service';
import { AccordionModule } from 'primeng/accordion';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { Student } from '../../../../core/models/Student';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmPopup } from "primeng/confirmpopup";
import { ConfirmationService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { BaseService } from '../../../../core/services/shared/base.service';
import { MainLayoutService } from '../../../../main-layout/main-layout.service';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, TableModule, ButtonModule, IconFieldModule, 
    InputIconModule, InputTextModule, FormsModule, RouterModule, 
    SelectModule, OverlayBadgeModule, BadgeModule, AccordionModule, 
    GalleriaModule, DialogModule, ConfirmPopup, MultiSelectModule, DrawerModule],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList extends BaseService<Student> {
  
  students = signal<Student[]>([]);

  showAddressDialog = false;
  selectedAddress: any = null;

  showPhotosDialog = false;
  selectedPhotos: string[] = [];

  showCoursesDialog = false;
  selectedCourses: any[] = [];
  loggedUserRole: string| undefined= '';

  allColumns = [
    { field: 'profilePic', header: 'Profile', sortable: false },
    { field: 'user.name', header: 'Name', sortable: true },
    { field: 'user.email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone', sortable: true },
    { field: 'rollNo', header: 'Roll No', sortable: true },
    { field: 'enrollmentNo', header: 'Enrollment No', sortable: true },
    { field: 'dob', header: 'DOB', sortable: true },
    { field: 'gender', header: 'Gender', sortable: true },
    { field: 'guardianName', header: 'Guardian Name', sortable: false },
    { field: 'guardianContact', header: 'Guardian Contact', sortable: false },
    { field: 'address', header: 'Address', sortable: false },
    { field: 'photos', header: 'Docs', sortable: false },
    { field: 'courses', header: 'Courses', sortable: false },
  ];

  override selectedColumns = signal([...this.allColumns]);
  // Override filter to specify fields
  override globalFilter = [
      'user.name', 'user.email', 'user.role', 'phone', 'courses',
      'guardianName', 'guardianContact', 'gender', 'createdBy', 'updatedBy', 
  ]

  constructor(private mainLayoutService: MainLayoutService, public router: Router, private studentService: StudentService, private authService: AuthService, private confirmService: ConfirmationService) {
    super();
    const user = this.authService.current_user();
    this.loggedUserRole = user?.role;
  }
  
  ngOnInit(): void {
    this.fetchItems();
  }

  get visibleColumns() {
    const cols = [...this.selectedColumns()];
    if (this.loggedUserRole === 'admin') {
      cols.push({ field: 'createdBy', header: 'Created By', sortable: true });
      cols.push({ field: 'updatedBy', header: 'Updated By', sortable: true });
    }
    if (this.loggedUserRole === 'admin' || this.loggedUserRole === 'editor') {
      cols.push({ field: 'actions', header: 'Actions', sortable: false });
    }
    return cols;
  }

  get isMobile() {
    return this.mainLayoutService.isMobile;
  }

  toggleFilterMenu() {
    this.filterMenuVisible.update(v => !v);
  }

  override fetchItems(): void {
    this.loading.set(true);
    this.studentService.getAllStudents().subscribe({
      next: (data: Student[]) => {
        this.items.set(data);
        this.customrGlobalFilterItems.set(data);
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

  deleteStudent(id: string, event: any) {
    this.confirmService.confirm({
                key:'deleteStudent',
                target: event.currentTarget as EventTarget,
                message: 'Are you sure you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                rejectButtonProps: {
                    label: 'Cancel',
                    severity: 'secondary',
                    outlined: true
                },
                acceptButtonProps: {
                    label: 'Save'
                },
                accept: () => {
                  this.studentService.deleteStudent(id).subscribe({
                        next: () => {
                          this.fetchItems();
                        },
                        error: (err) => {
                          console.error('Failed to delete student', err);
                        }
                      });
                }
        })
  }
}
