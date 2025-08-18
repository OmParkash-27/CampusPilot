import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { UserService } from '../user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '../../../../core/models/User';

@Component({
  selector: 'app-user-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, FileUploadModule,RouterModule],
  templateUrl: './add-edit.html',
  styleUrls: ['./add-edit.scss']
})
export class AddEdit implements OnInit {
  userForm!: FormGroup;
  userId: string | null = null;
  roles = ['student', 'editor', 'teacher', 'admin'];
  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['student', Validators.required],
      status: [true],
      profilePic: [null]
    });

    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.userService.getById(this.userId).subscribe((user: User) => {
        this.userForm.patchValue(user);
      });
    }
  }

  get f() { return this.userForm.controls; }

  onFileSelect(event: any) {
    if (event.files && event.files.length) {
      this.userForm.patchValue({ profilePic: event.files[0] });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.userForm.value).forEach(key => {
      if (this.userForm.value[key] !== null) {
        formData.append(key, this.userForm.value[key]);
      }
    });

    if (this.userId) {
      this.userService.update(formData, this.userId).subscribe(() => {
        this.router.navigate(['/admin/users']);
      });
    } else {
      this.userService.create(formData).subscribe(() => {
        this.router.navigate(['/admin/users']);
      });
    }
  }
}
