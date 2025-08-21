import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { StudentService } from '../student.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Student } from '../../../../core/models/Student';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-student-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, FileUploadModule, RouterModule],
  templateUrl: './student-add-edit.html',
  styleUrls: ['./student-add-edit.scss']
})
export class AddEditStudent implements OnInit {
  API_URL = environment.apiUrl;
  studentForm!: FormGroup;
  studentId: string | null = null;
  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  submitted = false;
  previewUrl: string | undefined = '';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rollNo: ['', Validators.required],
      status: [true],
      profilePic: [null]
    });

    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.studentService.getById(this.studentId).subscribe((student: any) => {
        this.studentForm.patchValue({
          name: student.user.name,
          email: student.user.email,
          rollNo: student.rollNo,
          status: student.user.status
        });
        try {
          this.previewUrl = student.user.profilePic;
        } catch {}
      });
    }
  }

  get f() { return this.studentForm.controls; }

  onFileSelect(event: any) {
    if (event.files && event.files.length) {
      this.studentForm.patchValue({ profilePic: event.files[0] });
      this.previewUrl = '';
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.studentForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.studentForm.value).forEach(key => {
      if (this.studentForm.value[key] !== null) {
        formData.append(key, this.studentForm.value[key]);
      }
    });

    if (this.studentId) {
      this.studentService.update(formData, this.studentId).subscribe(() => {
        this.router.navigate(['/admin/student-list']);
      });
    } else {
      this.studentService.create(formData).subscribe(() => {
        this.router.navigate(['/admin/student-list']);
      });
    }
  }
}
