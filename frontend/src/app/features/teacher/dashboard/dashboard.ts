import { Component, OnInit, ChangeDetectorRef, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../../../core/services/auth/auth.service';

interface DashboardData {
  totalStudents: number;
  currentYearTotalStudents: number;
  totalBcaStudents: number;
  currentYearBcaStudents: number;
  totalMcaStudents: number;
  currentYearMcaStudents: number;
  totalBbaStudents: number;
  currentYearBbaStudents: number;
  totalMbaStudents: number;
  currentYearMbaStudents: number;
  lastCreated: any[];
  lastUpdated: any[];
  [key: string]: any; // allow dynamic key access in template
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, AvatarModule, TagModule, TooltipModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class TDashboard implements OnInit {
  loading = true;
  currentYear = new Date().getFullYear();
  today = new Date();

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  user = this.authService.current_user;

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  data: DashboardData = {
    totalStudents: 0, currentYearTotalStudents: 0,
    totalBcaStudents: 0, currentYearBcaStudents: 0,
    totalMcaStudents: 0, currentYearMcaStudents: 0,
    totalBbaStudents: 0, currentYearBbaStudents: 0,
    totalMbaStudents: 0, currentYearMbaStudents: 0,
    lastCreated: [], lastUpdated: []
  };

  barData: any = {};
  barOptions: any = {};

  // Course rows for the breakdown panel
  courses = [
    { name: 'BCA', icon: 'pi pi-desktop',        color: '#3b82f6', totalKey: 'totalBcaStudents', yearKey: 'currentYearBcaStudents' },
    { name: 'MCA', icon: 'pi pi-microchip',       color: '#10b981', totalKey: 'totalMcaStudents', yearKey: 'currentYearMcaStudents' },
    { name: 'BBA', icon: 'pi pi-briefcase',       color: '#f59e0b', totalKey: 'totalBbaStudents', yearKey: 'currentYearBbaStudents' },
    { name: 'MBA', icon: 'pi pi-chart-line',      color: '#a78bfa', totalKey: 'totalMbaStudents', yearKey: 'currentYearMbaStudents' },
  ];

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        this.data = { ...this.data, ...res };
        this.buildCharts();
        Promise.resolve().then(() => { this.loading = false; this.cdr.detectChanges(); });
      },
      error: () => {
        Promise.resolve().then(() => { this.loading = false; this.cdr.detectChanges(); });
      }
    });
  }

  private buildCharts(): void {
    const isDark = document.documentElement.classList.contains('my-dark');
    const labelColor  = isDark ? '#94a3b8' : '#475569';
    const gridColor   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
    const tooltipBg   = isDark ? '#1e293b' : '#ffffff';
    const tooltipText = isDark ? '#e2e8f0' : '#0f172a';

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a78bfa', '#f87171'];

    this.barData = {
      labels: ['All', 'BCA', 'MCA', 'BBA', 'MBA'],
      datasets: [{
        label: 'Total',
        data: [
          this.data.totalStudents,
          this.data.totalBcaStudents,
          this.data.totalMcaStudents,
          this.data.totalBbaStudents,
          this.data.totalMbaStudents
        ],
        backgroundColor: COLORS,
        borderRadius: 6,
        borderSkipped: false,
      }, {
        label: `${this.currentYear}`,
        data: [
          this.data.currentYearTotalStudents,
          this.data.currentYearBcaStudents,
          this.data.currentYearMcaStudents,
          this.data.currentYearBbaStudents,
          this.data.currentYearMbaStudents
        ],
        backgroundColor: COLORS.map(c => c + '55'),
        borderRadius: 6,
        borderSkipped: false,
      }]
    };

    this.barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: labelColor, font: { size: 12 } } },
        tooltip: {
          backgroundColor: tooltipBg, titleColor: tooltipText,
          bodyColor: labelColor, borderWidth: 1, padding: 10,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          cornerRadius: 8,
        }
      },
      scales: {
        x: { ticks: { color: labelColor }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: labelColor, stepSize: 1 }, grid: { color: gridColor } }
      }
    };
  }

  getCoursePct(totalKey: string, base: number): number {
    if (!base) return 0;
    return Math.round(((this.data as any)[totalKey] / base) * 100);
  }

  navigateTo(path: string): void { this.router.navigate([path]); }
}
