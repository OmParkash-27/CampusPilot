import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, ReorderableColumn } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../../../core/models/User';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { BaseService } from '../../../../core/services/shared/base.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { MainLayoutService } from '../../../../main-layout/main-layout.service';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, IconFieldModule, InputIconModule, 
    InputTextModule, FormsModule, RouterModule, SelectModule, CheckboxModule, OverlayBadgeModule, BadgeModule, 
    ConfirmPopupModule, MultiSelectModule, DrawerModule ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList extends BaseService<User> implements OnInit  {
 
  users = signal<User[]>([]);
  
  allColumns = [
    { field: 'profilePic', header: 'Profile', sortable: false },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'role', header: 'Role', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'actions', header: 'Actions', sortable: false },
  ];

  override selectedColumns = signal([...this.allColumns]);

  private prevRole: User['role'] | null = null;
  // Filtering logic
  override globalFilter = ['name', 'email', 'role', 'status'];
  
  constructor(authService: AuthService, private mainLayoutService: MainLayoutService, public router: Router, private userService: UserService, private confirmService: ConfirmationService) {
    super(authService);
  }
  
  ngOnInit(): void {
    this.fetchItems();
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

  fetchItems(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.items.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  navigate(id: string) {
    this.router.navigate(['admin/user-add-edit',id]);
  }

  onStatusChange(user: User | undefined, event: any) {
    if (!user) return;
    const userStatus = event?.checked;
    this.userService.updateStatus(user._id, userStatus).subscribe({
      next: () => {
        user.status = userStatus; 
      },
      error: () => {
        user.status = !user.status;
      }
    });
  }

  onRoleFocus(userRole: User['role']) {
    this.prevRole = userRole;
  }

  onRoleChange(user: User, event:any) {
  if (!user) return;
  const selectedRole = event.value;
  const oldRole = this.prevRole || user.role; 
  this.userService.updateRole(user._id, selectedRole).subscribe({
    next: () => {
      user.role = selectedRole;
    },
    error: () => {      
       user.role = oldRole;
    }
  });
  }

  deleteUser(userId: string, event: any) {
    this.confirmService.confirm({
            key:'deletePopup',
            target: event.currentTarget as EventTarget,
            message: 'Are you sure you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Save'
            },
            accept: () => {
              this.userService.delete(userId).subscribe(() => this.fetchItems());
            }
    })
  }
}
