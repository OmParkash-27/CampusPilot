import { Injectable, effect, signal, WritableSignal, computed } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { dashboardLabels, RoleMenuItem, sidebarMenuItems, speedDialItems } from './main.const';
import { User } from '../core/models/User';

@Injectable({
  providedIn: 'root'
})
export class MainLayoutService {
  private menuSignal: WritableSignal<RoleMenuItem[]> = signal<RoleMenuItem[]>([]);
  user: WritableSignal<User|null> = signal<User|null> (null);
  allSpeedDialItems: WritableSignal<MenuItem[]> = signal(speedDialItems);
  private windowWidth = signal(window.innerWidth);
  isMobile = computed(() => this.windowWidth() < 768);

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.setupMenuWatcher();
    this.initSpeedDialItems();
    this.applySavedTheme();
    this.resizeScreen();
  }

  resizeScreen() {
    const resizeHandler = () => this.windowWidth.set(window.innerWidth);
    window.addEventListener('resize', resizeHandler);

    // Clean up automatically when service is destroyed (rare in providedIn: 'root')
    effect((onCleanup) => {
      onCleanup(() => window.removeEventListener('resize', resizeHandler));
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => {});
  }

  private setupMenuWatcher() {
    effect(() => {
      this.user.set(this.authService.current_user());
      const current_user = this.user();

      //Menu Filter
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

  visibleSpeedDialItems = computed(() => {
    const user = this.authService.current_user();
    return this.allSpeedDialItems().filter(item =>
      user ? true : item.visible
    );
  });

  getSpeedDialContent() {
    return this.visibleSpeedDialItems;
  }

  getMenu() {
    return this.menuSignal.asReadonly();
  }

  private initSpeedDialItems() {
    const itemsWithCommands = speedDialItems.map(item => {
      switch (item.id) {
        case 'light':
          return { ...item, command: () => this.setTheme('light') };
        case 'dark':
          return { ...item, command: () => this.setTheme('dark') };
        case 'logout':
          return { ...item, command: () => this.logout() };
        default:
          return item;
      }
    });

    this.allSpeedDialItems.set(itemsWithCommands);
  }

  private applySavedTheme() {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    this.setTheme(savedMode ?? 'light');
  }

  private setTheme(mode: 'light' | 'dark') {
    if (mode === 'dark') {
      document.documentElement.classList.add('my-dark');
      localStorage.setItem('themeMode', 'dark');
    } else {
      document.documentElement.classList.remove('my-dark');
      localStorage.setItem('themeMode', 'light');
    }
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
