import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth/auth.service';
import { DialogActionService } from '../../shared/services/dialog-action-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, CommonModule, ChipModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {
  passwordForm: FormGroup;
  router = inject(Router);
  authService = inject(AuthService);
  private actionService = inject(DialogActionService);
  private sub!: Subscription;

   constructor(private fb: FormBuilder, public ref: DynamicDialogRef) {
    this.sub = this.actionService.submit$.subscribe(() => {
      this.onSave();
    });
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }


  onCancel() {
    this.ref.close(null);
  }

  onSave() {
    if (this.passwordForm.invalid) return;

    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      return;
    }

    // this.loading = true;
    // this.errorMsg = '';

    this.authService.changePassword(oldPassword!, newPassword!).subscribe({
      next: (res) => {
        // this.loading = false;

        // close dialog and send success
        this.ref.close({ success: true, message: res.message });
      },
      error: (err) => {
        // this.loading = false;
        // this.errorMsg = err?.error?.message || 'Something went wrong';
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}
