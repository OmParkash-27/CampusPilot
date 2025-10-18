import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const user = authService.current_user();

  if (user && allowedRoles?.includes(user.role)) {
    return true;
  }

  // Access denied — redirect to proper dashboard instead of login
  if (user) {
    // Redirect to respective dashboard
    router.navigate([`/${user.role}`]);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
