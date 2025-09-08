import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { MeterGroupModule } from 'primeng/metergroup';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { environment } from '../../../../environments/environment';
import { DashboardService } from './dashboard.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { User } from '../../../core/models/User';
import { Student } from '../../../core/models/Student';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, AvatarModule, AvatarGroupModule, MeterGroupModule, ChartModule, DividerModule, DialogModule, ButtonModule, ChipModule, BadgeModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  current_year = new Date().getFullYear();
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  user = this.authService.current_user; 
  API_URL = environment.apiUrl;
  usersDialongVisible = false;

  // signals for data
  dashboardData = signal<any>(null);
  latestUsers: User[] = [];
  latestStudents: Student[] = [];

  doughnutData: any;
  lineData: any;
  polarData: any;
  meterGroupValues: any=  [
            { label: 'BCA', color: '#34d399', value: 0 },
                { label: 'BBA', color: '#fbbf24', value: 0 },
                { label: 'MCA', color: '#60a5fa', value: 0 },
                { label: 'MBA', color: '#c084fc', value: 0 }
            ];

  router = inject(Router);

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe((res: any) => {
      this.dashboardData.set(res);
      // Users
      this.latestUsers = res.latestUsers;
      //Students
      this.latestStudents = res.latestStudents;
      // prepare charts
      this.doughnutData = {
        labels: ['Admins', 'Teachers', 'Editors', 'Students'],
        datasets: [
          {
            data: [
              res.totalAdmins,
              res.totalTeachers,
              res.totalEditors,
              res.totalStudents
            ],
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
          }
        ]
      };

      this.lineData = {
        labels: ['BCA', 'BBA', 'MCA', 'MBA'],
        datasets: [
          {
            label: `Students  ${this.current_year} `,
            data: [res.currentYearBcaStudents, res.currentYearBbaStudents, res.currentYearMcaStudents, res.currentYearMbaStudents],
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          }
        ]
      };

      this.polarData = {
        labels: ['BCA', 'MCA', 'MBA', 'BBA'],
        datasets: [
          {
            data: [40, 25, 20, 15],
            backgroundColor: [
              '#42A5F5',
              '#66BB6A',
              '#FFA726',
              '#AB47BC'
            ]
          }
        ]
      };

      this.meterGroupValues = [
            { label: 'BCA', color: '#34d399', value: res.currentYearBcaStudents },
                { label: 'BBA', color: '#fbbf24', value: res.currentYearBbaStudents },
                { label: 'MCA', color: '#60a5fa', value: res.currentYearMcaStudents },
                { label: 'MBA', color: '#c084fc', value: res.currentYearMbaStudents }
            ]
    });
  }

  showAllUsers() {
    this.usersDialongVisible = true
  }
  
}