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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, AvatarModule, TagModule, TooltipModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class EDashboard implements OnInit {
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

  doughnutData: any = {};
  doughnutOptions: any = {};

  // Merged activity feed: combine lastCreated + lastUpdated, tag each, sort by recency
  activityFeed: Array<{ student: any; action: 'created' | 'updated' }> = [];

  // Metric strip items (computed after data loads)
  metrics: Array<{ label: string; value: number; sub: string; color: string; icon: string }> = [];

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        this.data = { ...this.data, ...res };
        this.buildMetrics();
        this.buildActivityFeed();
        this.buildCharts();
        Promise.resolve().then(() => { this.loading = false; this.cdr.detectChanges(); });
      },
      error: () => {
        Promise.resolve().then(() => { this.loading = false; this.cdr.detectChanges(); });
      }
    });
  }

  private buildMetrics(): void {
    this.metrics = [
      { label: 'Total Students',         value: this.data.totalStudents,             sub: 'all records',          color: '#6366f1', icon: 'pi pi-users' },
      { label: `${this.currentYear} New`, value: this.data.currentYearTotalStudents,  sub: 'enrolled this year',   color: '#10b981', icon: 'pi pi-calendar-plus' },
      { label: 'You Added',               value: this.data.lastCreated.length,        sub: 'of your records',      color: '#f59e0b', icon: 'pi pi-user-plus' },
      { label: 'You Edited',              value: this.data.lastUpdated.length,        sub: 'recent edits',         color: '#ec4899', icon: 'pi pi-pencil' },
    ];
  }

  private buildActivityFeed(): void {
    const created = (this.data.lastCreated ?? []).map(s => ({ student: s, action: 'created' as const }));
    const updated = (this.data.lastUpdated ?? []).map(s => ({ student: s, action: 'updated' as const }));
    // interleave — created first since both are sorted desc by createdAt from the API
    this.activityFeed = [...created, ...updated].slice(0, 8);
  }

  private buildCharts(): void {
    const isDark = document.documentElement.classList.contains('my-dark');
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const tooltipBg  = isDark ? '#1e293b' : '#ffffff';
    const borderClr  = isDark ? '#1e293b' : '#ffffff';

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#22d3ee'];

    this.doughnutData = {
      labels: ['BCA', 'MCA', 'BBA', 'MBA'],
      datasets: [{
        data: [
          this.data.totalBcaStudents,
          this.data.totalMcaStudents,
          this.data.totalBbaStudents,
          this.data.totalMbaStudents
        ],
        backgroundColor: [COLORS[0], COLORS[1], COLORS[2], COLORS[3]],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: borderClr,
      }]
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: labelColor, padding: 14, font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: tooltipBg, titleColor: isDark ? '#e2e8f0' : '#0f172a',
          bodyColor: labelColor, borderWidth: 1, padding: 10,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          cornerRadius: 8,
        }
      }
    };
  }

  navigateTo(path: string): void { this.router.navigate([path]); }
}
