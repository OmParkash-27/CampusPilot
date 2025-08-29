import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

import { DashboardService } from './dashboard.service';
import { RecentList } from '../../common/dashboards-component/components/recent-list/recent-list';
import { StatsCard } from '../../common/dashboards-component/components/stats-card/stats-card';


interface DashboardData {
  totalStudents: number;
  currentYearTotalStudents: number,
  totalBcaStudents: number,
  currentYearBcaStudents: number,
  totalMcaStudents: number,
  currentYearMcaStudents: number,
  totalBbaStudents: number,
  currentYearBbaStudents: number,
  totalMbaStudents: number,
  currentYearMbaStudents: number,
  lastCreated: any[];
  lastUpdated: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RecentList, StatsCard, ChartModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class TDashboard implements OnInit {
  loading = true;
  currentYear = new Date().getFullYear();
  

  // Default values to avoid null checks in HTML
  data: DashboardData = {
    totalStudents: 0,
    currentYearTotalStudents: 0,
    totalBcaStudents: 0,
    currentYearBcaStudents: 0,
    totalMcaStudents: 0,
    currentYearMcaStudents: 0,
    totalBbaStudents: 0,
    currentYearBbaStudents: 0,
    totalMbaStudents: 0,
    currentYearMbaStudents: 0,
    lastCreated: [],
    lastUpdated: []
  };

  // Chart models
  barData: any = {};
  pieData: any = {};
  chartOptions: any = {};

  studentCols = [
    { field: 'user.name', header: 'Name' },
    { field: 'courses[0].course', header: 'Course' },
    { field: 'rollNo', header: 'Roll No' },
  ];

  userCols = [
    { field: 'user.name', header: 'Name' },
    { field: 'courses[0].course', header: 'Course' },
    { field: 'rollNo', header: 'Roll No' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        // merge received values onto defaults
        this.data = { ...this.data, ...res };

        const labels = ['All Students', 'BCA', 'MCA', 'BBA', 'MBA'];
        const counts = [
          this.data.totalStudents,
          this.data.totalBcaStudents,
          this.data.totalMcaStudents,
          this.data.totalBbaStudents,
          this.data.totalMbaStudents
        ];

        // Bar chart
        this.barData = {
          labels,
          datasets: [
            {
              label: 'Counts',
              backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26C6DA'],
              data: counts
            }
          ]
        };

        // Pie chart
        this.pieData = {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26C6DA'],
              hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#C58CE0', '#FF8A65', '#4DD0E1']
            }
          ]
        };

        this.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#495057' }
            }
          },
          scales: {
            x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
            y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } }
          }
        };

        // Defer changing loading flag to avoid ExpressionChangedAfterItHasBeenCheckedError.
        // Promise.resolve pushes it to the microtask queue (safe & light-weight).
        Promise.resolve().then(() => {
          this.loading = false;
          // ensure change detection runs
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Dashboard load error', err);
        // still clear loading to show error state / empty UI
        Promise.resolve().then(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
}
