import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { Student } from '../../../core/models/Student';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminStudentContextService } from '../../../core/services/admin-student-context/admin-student-context.service';
import { StudentPicker } from '../../admin/student-picker/student-picker';

@Component({
  selector: 'app-Sdashboard',
  standalone: true,
  imports: [
    CommonModule, AvatarModule, ButtonModule, GalleriaModule,
    TagModule, TooltipModule, RouterModule,
    StudentPicker,       // admin student-selection dialog
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class SDashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService      = inject(AuthService);
  private adminContext     = inject(AdminStudentContextService);
  router = inject(Router);

  // ── Auth state (read-only — authenticated user never changes) ──────────────
  currentUser = this.authService.current_user;
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // ── Selected student context (admin-only) ──────────────────────────────────
  selectedStudent = this.adminContext.selectedStudent;

  // ── Student picker dialog visibility ──────────────────────────────────────
  pickerVisible: WritableSignal<boolean> = signal(false);

  // ── Dashboard data ─────────────────────────────────────────────────────────
  student: WritableSignal<Student | null> = signal<Student | null>(null);
  photos: WritableSignal<string[]> = signal<string[]>([]);
  loading: WritableSignal<boolean> = signal(false);
  loadError: WritableSignal<string | null> = signal(null);

  // Lightbox
  galleriaVisible = false;
  activePhotoIndex = 0;
  responsiveOptions: any[] = [
    { breakpoint: '1300px', numVisible: 3 },
    { breakpoint: '1080px', numVisible: 2 },
    { breakpoint: '575px',  numVisible: 1 },
  ];

  // Greeting
  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  today = new Date();

  // Profile completion
  profileCompletion = computed(() => {
    const s = this.student();
    if (!s) return 0;
    const checks = [
      !!s.user?.profilePic, !!s.rollNo, !!s.enrollmentNo,
      s.courses?.length > 0, !!s.dob, !!s.gender,
      !!s.phone, !!s.address?.city, !!s.guardianName, !!s.guardianContact,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  });

  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    if (status === 'active')    return 'success';
    if (status === 'graduated') return 'warn';
    return 'secondary';
  }

  ngOnInit(): void {
    if (this.isAdmin() && !this.adminContext.selectedStudentId) {
      // Admin arrived without a selected student → open picker immediately
      this.pickerVisible.set(true);
      return;
    }
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.dashboardService.getDashboardData().subscribe({
      next: (res: Student) => {
        this.student.set(res);
        this.photos.set(res.photos ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Failed to load student data.');
        this.loading.set(false);
      },
    });
  }

  /** Called when admin picks a student from the picker dialog */
  onStudentPicked(student: Student): void {
    this.adminContext.setStudent(student);
    this.loadDashboard();
  }

  /** Admin wants to switch to a different student */
  openPicker(): void {
    this.pickerVisible.set(true);
  }

  openPhoto(index: number): void {
    this.activePhotoIndex = index;
    this.galleriaVisible = true;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
