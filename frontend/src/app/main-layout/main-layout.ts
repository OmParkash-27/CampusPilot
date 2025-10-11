import { Component, Signal, computed, effect, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { RoleMenuItem } from './main.const';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MainLayoutService } from './main-layout.service';
import { ChipModule } from 'primeng/chip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, SpeedDialModule, RouterOutlet, MenubarModule, DrawerModule, ButtonModule, RouterModule, ConfirmDialogModule, ChipModule, ToggleSwitchModule ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayout {
  // Signals
  drawerVisible = signal(false);
  user = computed(() => this.mainLayoutService.user());
  itemsSignal!: Signal<RoleMenuItem[]>;
  speedDialOpen = false;
  speedDial: Signal<MenuItem[]>;

  constructor(
    private mainLayoutService: MainLayoutService, private router: Router
  ) { 
      this.itemsSignal = this.mainLayoutService.getMenu();
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.closeDrawer();
        }
      });
      this.speedDial = this.mainLayoutService.getSpeedDialContent();
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

}
