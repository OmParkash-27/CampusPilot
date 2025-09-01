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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, AvatarModule, AvatarGroupModule, MeterGroupModule, ChartModule, DividerModule, DialogModule, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  user = this.authService.current_user; // aapke AuthService se
  API_URL = environment.apiUrl;
  usersDialongVisible = false;

  // signals for data
  dashboardData = signal<any>(null);

  doughnutData: any;
  lineData: any;
  polarData: any;

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe((res: any) => {
      this.dashboardData.set(res);

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
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            label: 'Users Growth',
            data: [5, 10, 15, 25, res.totalUsers],
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
    });
  }

  showAllUsers() {
    this.usersDialongVisible = true
  }
  
}