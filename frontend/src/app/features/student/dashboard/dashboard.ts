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

@Component({
  selector: 'app-Sdashboard',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, GalleriaModule, TagModule, TooltipModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class SDashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  router = inject(Router);

  student: WritableSignal<Student | null> = signal<Student | null>(null);
  photos: WritableSignal<string[]> = signal<string[]>([]);

  // Lightbox state
  galleriaVisible = false;
  activePhotoIndex = 0;

  // Responsive options for full-screen galleria lightbox
  responsiveOptions: any[] = [
    { breakpoint: '1300px', numVisible: 3 },
    { breakpoint: '1080px', numVisible: 2 },
    { breakpoint: '575px',  numVisible: 1 },
  ];

  // Computed greeting
  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  today = new Date();

  // Profile completeness — count non-empty meaningful fields
  profileCompletion = computed(() => {
    const s = this.student();
    if (!s) return 0;
    const checks = [
      !!s.user?.profilePic,
      !!s.rollNo,
      !!s.enrollmentNo,
      s.courses?.length > 0,
      !!s.dob,
      !!s.gender,
      !!s.phone,
      !!s.address?.city,
      !!s.guardianName,
      !!s.guardianContact,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  });

  // Course status severity for PrimeNG Tag
  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    if (status === 'active')    return 'success';
    if (status === 'graduated') return 'warn';
    return 'secondary';
  }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res: Student) => {
        this.student.set(res);
        this.photos.set(res.photos ?? []);
      }
    });
  }

  openPhoto(index: number): void {
    this.activePhotoIndex = index;
    this.galleriaVisible = true;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
