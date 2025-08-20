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

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, RouterModule, SelectModule, CheckboxModule, OverlayBadgeModule, BadgeModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList implements OnInit {
  API_URL = environment.apiUrl;
  users = signal<User[]>([]);
  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Student', value: 'student' },
    { label: 'Editor', value: 'editor' },
    { label: 'Teacher', value: 'teacher' }
  ];
  loading = signal<boolean>(true);
  private prevRole: User['role'] | null = null;
  loggedUser: User | null = null;
  
  constructor(public router: Router, private userService: UserService) {
    this.loggedUser = this.userService.currentUser;
  }
  
  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (res) => {
        // Ensure each user.role matches the 'value' in roles
        const users = (res || []).map(user => ({
          ...user,
          // id: user._id,
          // role: user.role || '' // fallback if role is missing
        })) // .filter(user => this.userService.currentUser?.email != user.email);
        this.users.set(users);
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

  onRoleChange(user: User | undefined, event: any) {
  if (!user) return;
  const selectedRole = event.value;  
  this.userService.updateRole(user._id, selectedRole).subscribe({
    next: () => {
      user.role = selectedRole;
    },
    error: () => {
       user.role = this.prevRole as User['role'];
    }
  });
}


  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(userId).subscribe(() => this.loadUsers());
    }
  }
}
