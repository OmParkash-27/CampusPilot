import { CommonModule } from '@angular/common';
import { Component, inject, model, OnInit, signal, WritableSignal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { AuthService } from '../../../core/services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { Student } from '../../../core/models/Student';

@Component({
  selector: 'app-Sdashboard',
  imports: [CommonModule, CardModule, AvatarModule, ImageModule, GalleriaModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class SDashboard implements OnInit {
  dashboardService = inject(DashboardService);
  user: WritableSignal<Student | null> = signal<Student | null>(null);
  API_URL = environment.apiUrl;
  images = model<any[]>([]);

  responsiveOptions: any[] = [
        {
            breakpoint: '1300px',
            numVisible: 3
        },
        {
            breakpoint: '1080px',
            numVisible: 2
        },
        {
            breakpoint: '992px',
            numVisible: 2
        },
        {
            breakpoint: '575px',
            numVisible: 1
        }
    ];

  ngOnInit(): void {
      this.dashboardService.getDashboardData().subscribe({
        next: (res) => {
          this.images.set(res.photos);
          this.user.set(res);
        }
      })
  }
}
