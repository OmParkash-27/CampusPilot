import { Injectable, effect, signal, WritableSignal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { RoleMenuItem, sidebarMenuItems } from './main.const';

@Injectable({
  providedIn: 'root'
})
export class MainLayoutService {
  // Writable signal so we can update menu items dynamically
  private menuSignal: WritableSignal<RoleMenuItem[]> = signal<RoleMenuItem[]>([]);

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.setupMenuWatcher();
  }

  private setupMenuWatcher() {
    effect(() => {
      const user = this.authService.current_user();

      const filteredMenu = sidebarMenuItems.map(item => {
        const visible = !!(
          user
            ? (item.public && item.showWhenLoggedIn) ||
              (!item.public && item.roles?.includes(user.role))
            : item.public
        );

        let updatedItem: RoleMenuItem = { ...item, visible };

        // Handle sub-items visibility
        if (item.items?.length) {
          updatedItem.items = item.items
            .map(subItem => {
              const subVisible = !!(
                user
                  ? (subItem.public && subItem.showWhenLoggedIn) ||
                    (!subItem.public && subItem.roles?.includes(user.role))
                  : subItem.public
              );
              return { ...subItem, visible: subVisible };
            })
            .filter(si => si.visible);
        }

        // Special handling for logout
        if (user && item.id === 'logout') {
          updatedItem = {
            ...updatedItem,
            visible: true,
            command: () => {
              this.confirmationService.confirm({
                message: 'Are you sure you want to log out?',
                header: 'Logout Confirmation',
                icon: 'pi pi-exclamation-triangle',
                rejectButtonStyleClass: 'text-red-500',
                accept: () => this.logout()
              });
            }
          };
        }

        return updatedItem;
      }).filter(item => item.visible);

      this.menuSignal.set(filteredMenu);
    });
  }

  /** Expose readonly menu signal to components */
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
