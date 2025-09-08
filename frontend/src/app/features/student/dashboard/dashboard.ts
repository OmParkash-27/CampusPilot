import { CommonModule } from '@angular/common';
import { Component, inject, model, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { AuthService } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-Sdashboard',
  imports: [CommonModule, CardModule, AvatarModule, ImageModule, GalleriaModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class SDashboard implements OnInit {
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);
  user = this.authService.current_user; 
  API_URL = environment.apiUrl;
  images = model<any[]>([]);

  responsiveOptions: any[] = [
        {
            breakpoint: '1300px',
            numVisible: 4
        },
        {
            breakpoint: '998px',
            numVisible: 2
        },
        {
            breakpoint: '575px',
            numVisible: 1
        }
    ];

  ngOnInit(): void {
      this.dashboardService.getDashboardData().subscribe({
        next: (res) => this.images.set(res.photos)
      })
  }
}
