import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { MeterGroupModule } from 'primeng/metergroup';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { DashboardService } from './dashboard.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../../../core/models/User';
import { Student } from '../../../core/models/Student';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    AvatarModule,
    AvatarGroupModule,
    MeterGroupModule,
    ChartModule,
    DividerModule,
    DialogModule,
    ButtonModule,
    ChipModule,
    BadgeModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  current_year = new Date().getFullYear();
  today = new Date();

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  router = inject(Router);

  user = this.authService.current_user;

  // Dialog visibility (fixed typo: was usersDialongVisible)
  usersDialogVisible = false;

  // Raw API response
  dashboardData = signal<any>(null);

  // Derived arrays
  latestUsers: User[] = [];
  latestStudents: Student[] = [];

  // Chart datasets
  doughnutData: any;
  lineData: any;
  polarData: any;
  doughnutOptions: any;
  lineOptions: any;
  polarOptions: any;

  meterGroupValues: any = [
    { label: 'BCA', color: '#3b82f6', value: 0 },
    { label: 'BBA', color: '#f59e0b', value: 0 },
    { label: 'MCA', color: '#10b981', value: 0 },
    { label: 'MBA', color: '#a78bfa', value: 0 },
  ];

  // Computed totals from the signal
  totalUsers = computed(() => {
    const d = this.dashboardData();
    if (!d) return 0;
    return (d.totalAdmins ?? 0) + (d.totalTeachers ?? 0) + (d.totalEditors ?? 0);
  });

  totalCurrentYear = computed(() => {
    const d = this.dashboardData();
    if (!d) return 0;
    return (d.currentYearBcaStudents ?? 0) + (d.currentYearBbaStudents ?? 0) +
           (d.currentYearMcaStudents ?? 0) + (d.currentYearMbaStudents ?? 0);
  });

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  ngOnInit(): void {
    this.buildChartOptions();

    this.dashboardService.getDashboardData().subscribe((res: any) => {
      this.dashboardData.set(res);
      this.latestUsers = res.latestUsers ?? [];
      this.latestStudents = res.latestStudents ?? [];
      this.buildChartData(res);
    });
  }

  private buildChartOptions(): void {
    const isDark = document.documentElement.classList.contains('my-dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipText = isDark ? '#e2e8f0' : '#0f172a';

    const tooltipConfig = {
      backgroundColor: tooltipBg,
      titleColor: tooltipText,
      bodyColor: labelColor,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: labelColor, padding: 16, font: { size: 12 } },
        },
        tooltip: tooltipConfig,
      },
    };

    this.lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: labelColor, font: { size: 12 } },
        },
        tooltip: tooltipConfig,
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: labelColor },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: labelColor, stepSize: 1 },
        },
      },
    };

    this.polarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: labelColor, padding: 16, font: { size: 12 } },
        },
        tooltip: tooltipConfig,
      },
      scales: {
        r: {
          grid: { color: gridColor },
          ticks: { color: labelColor, backdropColor: 'transparent' },
        },
      },
    };
  }

  private buildChartData(res: any): void {
    const COLORS = {
      blue:   '#3b82f6',
      green:  '#10b981',
      amber:  '#f59e0b',
      purple: '#a78bfa',
      cyan:   '#22d3ee',
    };

    this.doughnutData = {
      labels: ['Admins', 'Teachers', 'Editors', 'Students'],
      datasets: [{
        data: [res.totalAdmins, res.totalTeachers, res.totalEditors, res.totalStudents],
        backgroundColor: [COLORS.purple, COLORS.green, COLORS.amber, COLORS.blue],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: document.documentElement.classList.contains('my-dark') ? '#1e293b' : '#ffffff',
      }],
    };

    this.lineData = {
      labels: ['BCA', 'BBA', 'MCA', 'MBA'],
      datasets: [{
        label: `${this.current_year} Enrollments`,
        data: [
          res.currentYearBcaStudents,
          res.currentYearBbaStudents,
          res.currentYearMcaStudents,
          res.currentYearMbaStudents,
        ],
        fill: true,
        borderColor: COLORS.blue,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        pointBackgroundColor: COLORS.blue,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
      }],
    };

    this.polarData = {
      labels: ['BCA', 'BBA', 'MCA', 'MBA'],
      datasets: [{
        label: `${this.current_year} Course Distribution`,
        data: [
          res.currentYearBcaStudents,
          res.currentYearBbaStudents,
          res.currentYearMcaStudents,
          res.currentYearMbaStudents,
        ],
        backgroundColor: [
          'rgba(59,130,246,0.75)',
          'rgba(245,158,11,0.75)',
          'rgba(16,185,129,0.75)',
          'rgba(167,139,250,0.75)',
        ],
        borderWidth: 0,
      }],
    };

    this.meterGroupValues = [
      { label: 'BCA', color: COLORS.blue,   value: res.currentYearBcaStudents },
      { label: 'BBA', color: COLORS.amber,  value: res.currentYearBbaStudents },
      { label: 'MCA', color: COLORS.green,  value: res.currentYearMcaStudents },
      { label: 'MBA', color: COLORS.purple, value: res.currentYearMbaStudents },
    ];
  }

  showAllUsers(): void {
    this.usersDialogVisible = true;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      admin: 'danger', teacher: 'success', editor: 'warn', student: 'info',
    };
    return map[role] ?? 'secondary';
  }
}
