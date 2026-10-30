import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, BreadcrumbModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss'
})
export class Breadcrumb {
  private breadcrumbService = inject(BreadcrumbService);

  readonly state = this.breadcrumbService.state;

  /** True when there is only one crumb — nothing to navigate back from. */
  readonly isSingleCrumb = computed(() => this.state().items.length <= 1);

  /** Home item pinned to the left of every trail. */
  readonly homeItem = { icon: 'pi pi-home', routerLink: '/home' };
}
