import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { StudentService } from '../../common/students/student.service';
import { Student } from '../../../core/models/Student';

@Component({
  selector: 'app-student-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    ButtonModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './student-picker.html',
  styleUrl: './student-picker.scss',
})
export class StudentPicker implements OnInit {
  private studentService = inject(StudentService);

  /** Two-way binding on the dialog visibility */
  @Input()  visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Emits the student the admin selected */
  @Output() studentSelected = new EventEmitter<Student>();

  loading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);
  allStudents: WritableSignal<Student[]> = signal([]);
  searchTerm: WritableSignal<string> = signal('');

  skeletons = Array(4).fill(null);

  filteredStudents = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allStudents();
    return this.allStudents().filter(s =>
      s.user?.name?.toLowerCase().includes(term) ||
      s.user?.email?.toLowerCase().includes(term) ||
      s.rollNo?.toLowerCase().includes(term) ||
      (s.enrollmentNo ?? '').toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.studentService.getAllStudents().subscribe({
      next: (students: Student[]) => {
        this.allStudents.set(students);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load students. Please try again.');
        this.loading.set(false);
      },
    });
  }

  select(student: Student): void {
    this.studentSelected.emit(student);
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ngOnInit();
  }

  getStatusSeverity(status: boolean): 'success' | 'danger' {
    return status ? 'success' : 'danger';
  }
}
