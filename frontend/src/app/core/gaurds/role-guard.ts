import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const RoleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.current_user();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    } else {
      router.navigate(['/unauthorized']); // or dashboard
      return false;
    }
  };
};
