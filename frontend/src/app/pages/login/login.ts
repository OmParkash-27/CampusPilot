import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { AuthService } from '../../core/services/auth/auth.service';
import { switchMap } from 'rxjs';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    FileUploadModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  submitted = signal(false);
  mode = signal<'login' | 'register'>('login');

  fb = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  registrationError: string | null = null; 

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const m = params.get('mode');
      this.mode.set(m === 'register' ? 'register' : 'login');
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      profilePic: [null]
    });
  }

  onSubmitLogin() {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).pipe(
        switchMap(() => this.authService.loadCurrentUser())
      ).subscribe({
      next: (user) => {
        if (user?.role) {
          this.router.navigate([`/${user.role}`]); // Navigate based on role
        } else {
          console.error('User role not found');
        }
      },
        error: (err) => console.error('Error:', err)
    });
  }

  onSubmitRegister() {
    this.submitted.set(true);
    if (this.registerForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.registerForm.value.name);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);

    if (this.registerForm.value.profilePic) {
      formData.append('profilePic', this.registerForm.value.profilePic);
    }

    this.authService.register(formData).pipe(
        switchMap(() => this.authService.loadCurrentUser())
      ).subscribe({
      next: (user) => {
        if (user?.role) {
          this.router.navigate([`/${user.role}`]); // Navigate based on role
        } else {
          console.error('User role not found');
        }
      },
      error: (err) => {
      console.error(err);

      const backendMsg = err?.error?.message?.toLowerCase() || '';

      if (backendMsg.includes('user already exists')) {
        this.registrationError = 'This email is already registered. Please log in or use a different email.';
      } else if (backendMsg.includes('registration failed')) {
        this.registrationError = 'Registration failed due to a server error. Please try again later.';
      } else {
        this.registrationError = 'Registration failed. Please try again.';
      }
    }
    });
  }

  get fLogin() {
    return this.loginForm.controls;
  }
  get fRegister() {
    return this.registerForm.controls;
  }
}
