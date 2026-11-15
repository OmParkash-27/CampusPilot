import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AdminStudentContextService } from '../services/admin-student-context/admin-student-context.service';

/**
 * adminStudentGuard
 *
 * When an Admin navigates to any student/* sub-route that requires a
 * selected student context (upload-files, view-documents), this guard checks
 * whether the AdminStudentContextService has a selectedStudent set.
 *
 * If not, it redirects to /student/dashboard where the Admin will be prompted
 * to pick a student first.
 *
 * Students are not affected by this guard — the RoleGuard runs before this one
 * and only allows student role or admin role to reach these routes.  For
 * actual students, selectedStudent will always be null (they don't use this
 * service), so this guard should NOT run for them.  This is enforced by only
 * adding this guard on routes that the student routes file explicitly opts in.
 *
 * NOTE: This guard is intentionally not added to the dashboard route because
 * the SDashboard component itself handles the "no student selected" state by
 * showing the picker dialog inline.
 */
export const adminStudentGuard: CanActivateFn = () => {
  const authService    = inject(AuthService);
  const contextService = inject(AdminStudentContextService);
  const router         = inject(Router);

  const user = authService.current_user();

  // Only enforce for admins — real students pass through unconditionally.
  if (!user || user.role !== 'admin') return true;

  // Admin must have a selected student to access sub-pages.
  if (contextService.selectedStudent()) return true;

  // No student selected → send admin back to student dashboard to pick one.
  router.navigate(['/student/dashboard']);
  return false;
};
