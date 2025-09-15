import { Injectable, effect, signal, WritableSignal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { dashboardLabels, RoleMenuItem, sidebarMenuItems } from './main.const';
import { User } from '../core/models/User';

@Injectable({
  providedIn: 'root'
})
export class MainLayoutService {
  // Writable signal so we can update menu items dynamically
  private menuSignal: WritableSignal<RoleMenuItem[]> = signal<RoleMenuItem[]>([]);
  user: WritableSignal<User|null> = signal<User|null> (null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.setupMenuWatcher();
  }

  private setupMenuWatcher() {
    effect(() => {
      this.user.set(this.authService.current_user());
      const current_user = this.user();

      const filteredMenu = sidebarMenuItems.map(item => {
        const visible = !!(
          current_user
            ? (item.public && item.showWhenLoggedIn) ||
              (!item.public && item.roles?.includes(current_user.role))
            : item.public
        );

        let updatedItem: RoleMenuItem = { ...item, visible };

        // Handle sub-items visibility
        if (item.items?.length) {
          updatedItem.items = item.items
            .map(subItem => {
              const subVisible = !!(
                current_user
                  ? (subItem.public && subItem.showWhenLoggedIn) ||
                    (!subItem.public && subItem.roles?.includes(current_user.role))
                  : subItem.public
              );
              return { ...subItem, visible: subVisible };
            })
            .filter(si => si.visible);
        }

        // Special handling for logout
        if (this.user() && item.id === 'logout') {
          updatedItem = {
            ...updatedItem,
            visible: true,
            command: () => {
              this.confirmationService.confirm({
                key: 'logoutDialog',
                message: 'Are you sure you want to log out?',
                header: 'Logout Confirmation',
                icon: 'pi pi-exclamation-triangle',
                rejectButtonStyleClass: 'bg-red-500',
                accept: () => this.logout()
              });
            }
          };
        }

        //Rename Dashboards
        if(this.user()?.role === 'admin' && dashboardLabels[item?.id!]) {
          const label = dashboardLabels[item?.id!];
          updatedItem = {...updatedItem, label:label}
        }

        return updatedItem;
      }).filter(item => item.visible);

      this.menuSignal.set(filteredMenu);
    });
  }

  getMenu() {
    return this.menuSignal.asReadonly();
  }

  private logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.current_user.set(null);
        this.router.navigate(['/']);
      },
      error: err => console.error('Logout failed:', err)
    });
  }
}
