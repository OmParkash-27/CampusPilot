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
import { environment } from '../../environments/environment';
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
export class MainLayout implements AfterViewInit, OnDestroy {
  // Signals
  drawerVisible = signal(false);
  windowWidth = signal(window.innerWidth);
  isMobile = computed(() => this.windowWidth() < 768);
  private resizeHandler = () => this.windowWidth.set(window.innerWidth);
  
  user = computed(() => this.mainLayoutService.user());
  itemsSignal!: Signal<RoleMenuItem[]>;
  API_URL = environment.apiUrl;
  
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

  ngAfterViewInit() {
    // Set initial width safely after view is ready
    setTimeout(() => {
      this.windowWidth.set(window.innerWidth);
    });

    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    // Cleanup the resize event listener
    window.removeEventListener('resize', this.resizeHandler);
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
