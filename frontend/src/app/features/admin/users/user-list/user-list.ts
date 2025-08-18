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

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, RouterModule, SelectModule, CheckboxModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Student', value: 'student' },
    { label: 'Editor', value: 'editor' },
    { label: 'Teacher', value: 'teacher' }
  ];
  loading = signal<boolean>(true);
  currentUserRole = "";

  constructor(public router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (res) => {
        // Ensure each user.role matches the 'value' in roles
        const usersWithRole = (res || []).map(user => ({
          ...user,
          role: user.role || '' // fallback if role is missing
        }));
        this.users.set(usersWithRole);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onStatusChange(user: User | undefined, event: any) {
    if (!user) return;
    const userStatus = event?.returnValue;
    user.status = userStatus;
    
    this.userService.updateStatus(user.id, userStatus).subscribe();
  }

  currentRole(userRole: any) {
    this.currentUserRole = userRole;
  }

  onRoleChange(user: User | undefined, event: any) {
  if (!user) return;
  // console.log('user', " even", event);
  
  // const currentRole = user.role;
  const selectedRole = event.value;
  this.userService.updateRole(user.id, selectedRole).subscribe({
    next: () => {
      user.role = selectedRole; // update only on success
    },
    error: () => {
      console.log(this.currentUserRole, "u r");
      user.role = (this.currentUserRole) as User['role']; // revert on error
      
    }
  });
}


  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(userId).subscribe(() => this.loadUsers());
    }
  }
}
