import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, ReorderableColumn } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { StudentService } from '../student.service';
import { AccordionModule } from 'primeng/accordion';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { User } from '../../../../core/models/User';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BaseService } from '../../../../core/services/shared/base.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { MainLayoutService } from '../../../../main-layout/main-layout.service';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-new-register-student',
  imports: [CommonModule, TableModule, ButtonModule,IconFieldModule, InputIconModule, 
    InputTextModule, FormsModule, RouterModule, SelectModule, OverlayBadgeModule, 
    BadgeModule, AccordionModule, GalleriaModule, DialogModule, MultiSelectModule, DrawerModule],
  templateUrl: './new-register-student-list.html',
  styleUrl: './new-register-student-list.scss'
})
export class NewRegisterStudent extends BaseService<User> {

  allColumns = [
    { field: 'profilePic', header: 'Profile', sortable: false },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'actions', header: 'Action', sortable: false },
  ];

  override selectedColumns = signal([...this.allColumns]);
  override globalFilter = ['name', 'email', 'status'];

  constructor(private mainLayoutService: MainLayoutService, public router: Router, private studentService: StudentService, authService: AuthService) {
    super(authService);
  }
  
  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loading.set(true);
    this.studentService.getNewRegisteredStudent().subscribe({
      next: (data: any) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get visibleColumns() {
    const cols = [...this.selectedColumns()];
    return cols;
  }

  get isMobile() {
    return this.mainLayoutService.isMobile;
  }

  toggleFilterMenu() {
    this.filterMenuVisible.update(v => !v);
  }

  navigate(id: string) {
    this.router.navigate([`${this.loggedUserRole + '/common/student-add-edit/add-details'}`,id]);
  }


}
