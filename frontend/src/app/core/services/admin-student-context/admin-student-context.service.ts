import { Injectable, signal, WritableSignal } from '@angular/core';
import { Student } from '../../models/Student';

/**
 * AdminStudentContextService
 *
 * Holds the Student record that the Admin is currently viewing.
 * This is NOT an authentication state — the authenticated user always
 * remains the Admin.  This service only tracks which student's data
 * the Admin has chosen to inspect.
 *
 * Usage:
 *   • Set when admin picks a student from the selection dialog.
 *   • Read by student-feature components to decide which endpoint to call.
 *   • Cleared on logout or when admin leaves the student section.
 */
@Injectable({ providedIn: 'root' })
export class AdminStudentContextService {
  /** The student whose dashboard the admin is currently viewing. null = none selected. */
  readonly selectedStudent: WritableSignal<Student | null> = signal<Student | null>(null);

  setStudent(student: Student): void {
    this.selectedStudent.set(student);
  }

  clearStudent(): void {
    this.selectedStudent.set(null);
  }

  /** Convenience: returns the selected student's _id, or null. */
  get selectedStudentId(): string | null {
    return this.selectedStudent()?._id ?? null;
  }
}
