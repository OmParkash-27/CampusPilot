import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DialogActionService } from '../../services/dialog-action-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-device-management',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule],
  templateUrl: './device-management.html',
  styleUrls: ['./device-management.scss']
})
export class DeviceManagement implements OnInit {

  devices: any[] = [];
  private authService = inject(AuthService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private cd = inject(ChangeDetectorRef);
  private router= inject(Router);
  private actionService = inject(DialogActionService);
  private sub!: Subscription;
  ngOnInit() {
    this.loadDevices();
    this.sub = this.actionService.logoutAll$.subscribe(() => {
      this.logoutAll();
    });
  }

  loadDevices() {
    this.authService.getDevices().subscribe((res: any) => {
      this.devices = res.devices;
      this.cd.detectChanges();
    });
  }

  logoutDevice(id: string) {
    this.authService.logoutDevice(id).subscribe(() => {
      this.loadDevices();
    });
  }

  logoutAll() {
    this.authService.logoutAllDevices().subscribe({
      next: () => {
        this.authService.current_user.set(null);
        this.router.navigate(['/']);
      },
      error: err => console.error('Logout failed:', err),
    });
    this.ref.close({ logoutAll: true })
  }

  isMobileDevice(agent: string) {
    return /mobile/i.test(agent);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}