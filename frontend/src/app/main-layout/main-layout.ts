import { Component, Signal, computed, effect, signal, AfterViewInit, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule, RouterOutlet } from '@angular/router';
import { RoleMenuItem } from './main.const';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MainLayoutService } from './main-layout.service';
import { ChipModule } from 'primeng/chip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { LoadingService } from '../core/services/loading/loading-service';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChangePassword } from '../shared/component/change-password/change-password';
import { TableModule } from "primeng/table";
import { Popover, PopoverModule } from 'primeng/popover';
import { DialogFooter } from '../shared/component/dialog-footer/dialog-footer';
import { DialogHeader } from '../shared/component/dialog-header/dialog-header';
import { AuthService } from '../core/services/auth/auth.service';
import { DeviceManagement } from '../shared/component/device-management/device-management';
import { Bars } from '@primeicons/angular/bars';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Bars, CommonModule, FormsModule, PopoverModule, SpeedDialModule, RouterOutlet, MenubarModule, DrawerModule, ButtonModule,
     RouterModule, ConfirmDialogModule, ChipModule, ToggleSwitchModule, TableModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
  providers: [DialogService ]
})
export class MainLayout {
  // Signals
  drawerVisible = signal(false);
  user = computed(() => this.mainLayoutService.user());
  itemsSignal!: Signal<RoleMenuItem[]>;
  speedDialOpen = false;
  speedDial: Signal<MenuItem[]>;
  @ViewChild('op') popover!: any;
  @ViewChild('dialogHeader') dialogHeader!: TemplateRef<any>;
  @ViewChild('dialogFooter') dialogFooter!: TemplateRef<any>;
  ref: DynamicDialogRef | null = null;
  private dialogService = inject(DialogService);
  constructor(
    private mainLayoutService: MainLayoutService, private router: Router, private authService: AuthService, private loadingService: LoadingService
  ) { 
      this.itemsSignal = this.mainLayoutService.getMenu();
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
        // Immediately close drawer and show loader
          this.closeDrawer();
          this.loadingService.show();
        }

        if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          // Hide loader once navigation is complete or cancelled
          this.loadingService.hide();
        }
      });
      this.speedDial = this.mainLayoutService.getSpeedDialContent();
      this.showChangePassDialogEffect();
    }

    showChangePassDialogEffect() {
      effect(() => {
        if (this.mainLayoutService.showChangePassDialogSignal()) {
          this.show();  
          // reset after trigger
          this.mainLayoutService.showChangePassDialogSignal.set(false);
        }
      });
    }

    get isMobile() {
      return this.mainLayoutService.isMobile;
    }

    toggleDrawer() {
      this.drawerVisible.update((v) => !v);
    }

    closeDrawer() {
      if (this.isMobile()) {
        this.drawerVisible.set(false);
      }
    } 

    toggleSpeedDial() {
      this.speedDialOpen = !this.speedDialOpen;
    }

    showPopOver() {
      this.popover.toggle(event);
    }

    logOut() {
      this.mainLayoutService.logout();
      this.popover.hide();
    }

    show() {
      this.ref = this.dialogService.open(ChangePassword, {
        header: 'change', // we'll use custom header inside component
        modal: true,
        width: '40vw',
        closable: true,
        styleClass: 'custom-dialog', // 👈 important
        contentStyle: { padding: '0', overflow: 'hidden' },
        breakpoints: {
          '960px': '70vw',
          '640px': '95vw'
        },
        data: {
          header: {
            title: 'Change Password',
            icon: 'pi pi-lock',
            user: this.mainLayoutService.user()
          },
          footer: {
            buttons: [
              {
                label: 'Cancel',
                icon: 'pi pi-times',
                styleClass: 'p-button-text',
                action: (ref: any) => ref.close(null)
              },
              {
                label: 'Update',
                icon: 'pi pi-check',
                type: 'submit' 
                // action: (ref: any) => {
                //   ref.close({ buttonType: 'save' });
                // }
              }
            ]
          }
        },

        templates: {
          header: DialogHeader,
          footer: DialogFooter
        }
      });
        this.ref?.onClose.subscribe((data: any) => {
          if (data?.success) {
            // show toast or message
            console.log('Password changed');

            // optional: logout user (recommended)
            this.authService.logout().subscribe(() => {
              this.authService.current_user.set(null);
              this.router.navigate(['/']);
            });
          }
        });
    }

    openDevices() {
      this.ref = this.dialogService.open(DeviceManagement, {
        modal: true,
        width: '56vw',
        styleClass: 'custom-dialog',
        contentStyle: { padding: '10px 24px' },

        breakpoints: {
          '960px': '70vw',
          '640px': '90vw' 
        },

        data: {
          header: {
            title: 'Logged Devices',
            icon: 'pi pi-desktop',
            user: this.user()
          },
          footer: {
            buttons: [
              {
                label: 'Close',
                icon: 'pi pi-times',
                styleClass: 'p-button-text',
                action: (ref: any) => ref.close(null)
              },
              {
                label: 'Logout All',
                icon: 'pi pi-sign-out',
                styleClass: 'p-button-danger',
                type: 'logout-all'
                // action: () => this.logoutAllDevices()
              }
            ]
          }
        },

        templates: {
          header: DialogHeader,
          footer: DialogFooter
        }
      });

      this.popover.hide();
    }

    onProfileImageError() {
      const u = this.user();
      if (u) {
        u.profilePic = null;
      }
    }
}
