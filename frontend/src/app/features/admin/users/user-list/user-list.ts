import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
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
import { environment } from '../../../../../environments/environment';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, FormsModule, RouterModule, SelectModule, CheckboxModule, OverlayBadgeModule, BadgeModule, ConfirmPopupModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList implements OnInit {
  API_URL = environment.apiUrl;
  users = signal<User[]>([]);
  searchTerm: string = '';
  filteredUsers: User[] = [];

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Student', value: 'student' },
    { label: 'Editor', value: 'editor' },
    { label: 'Teacher', value: 'teacher' }
  ];
  loading = signal<boolean>(true);
  private prevRole: User['role'] | null = null;
  loggedUser: User | null = null;
  
  constructor(public router: Router, private userService: UserService, private confirmService: ConfirmationService) {
    this.loggedUser = this.userService.currentUser;
  }
  
  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers = this.users();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

    // Filtering logic
filterUsers() {
  const term = this.searchTerm.trim().toLowerCase();
  if (!term) {
    this.filteredUsers = this.users();
    return;
  }

  // multiple words split
  const keywords = term.split(/\s+/);

    this.filteredUsers = this.users().filter(user => {
      // fields to search in
      const haystack = [
        user?.name,
        user?.email,
        user?.status,
        user?.role
      ].join(' ').toLowerCase();

      return keywords.every(k => haystack.includes(k));
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
              this.userService.delete(userId).subscribe(() => this.loadUsers());
            }
    })
  }
}
