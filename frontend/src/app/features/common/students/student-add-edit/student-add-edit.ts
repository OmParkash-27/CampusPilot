import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { User } from '../../../../core/models/User';
import { Student } from '../../../../core/models/Student';
import { StudentService } from '../student.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../admin/users/user.service';

@Component({
  selector: 'app-student-add-edit',
  templateUrl: './student-add-edit.html',
  styleUrls: ['./student-add-edit.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    FileUploadModule
  ],
})
export class AddEditStudent implements OnInit {

  API_URL = environment.apiUrl;
  studentForm!: FormGroup;
  isEditMode = false;
  isPartialAdd = false;
  previewUrl:string | undefined = ''; // profilePic preview
  photoPreviews: string[] = []; // multiple photos preview
  minDateBatch: Date = new Date(1990, 0, 1);
  maxDateBatch: Date = new Date();

  coursesList = [
    { label: 'MCA', value: 'MCA' },
    { label: 'MBA', value: 'MBA' },
    { label: 'BCA', value: 'BCA' },
    { label: 'BBA', value: 'BBA' }
  ];

  statusList = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Graduated', value: 'graduated' }
  ];

  genderList = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  // Data
  userData?: User;
  studentData?: Student;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');     // case 2 (add details)
    const studentId = this.route.snapshot.paramMap.get('studentId'); // case 3 (edit)
    
    if (studentId) {
      // EDIT MODE
      this.isEditMode = true;
      this.loadStudent(studentId);
    } else if (userId) {
      // ADD DETAILS MODE
      this.isPartialAdd = true;
      this.loadUser(userId);
    } else {
      // ADD NEW STUDENT MODE
      this.initForm();
    }
  }

  private loadUser(userId: string) {
    this.userService.getById(userId).subscribe(user => {
      this.userData = user;
      this.initForm();
    });
  }

  private loadStudent(studentId: string) {
    this.studentService.getStudentById(studentId).subscribe(student => {
      this.studentData = student;
      this.userData = student.user as any; // populated via populate in backend
      this.initForm();
    });
  }

  private initForm() {
    this.studentForm = this.fb.group({
      userId: [this.userData?._id || (this.studentData?.user as any)?._id ],
      name: [this.userData?.name || '', Validators.required],
      email: [this.userData?.email || '', [Validators.required, Validators.email]],
      profilePic: [null],
      photos: [[]],
      rollNo: [this.studentData?.rollNo || '', Validators.required],
      enrollmentNo: [this.studentData?.enrollmentNo || ''],
      dob: [this.studentData?.dob || ''],
      gender: [this.studentData?.gender || ''],
      phone: [this.studentData?.phone || ''],
      address: this.fb.group({
        street: [this.studentData?.address?.street || ''],
        city: [this.studentData?.address?.city || ''],
        state: [this.studentData?.address?.state || ''],
        zip: [this.studentData?.address?.zip || ''],
      }),
      guardianName: [this.studentData?.guardianName || ''],
      guardianContact: [this.studentData?.guardianContact || ''],
      courses: this.fb.array([]),
    });

    if (this.userData?.profilePic) {
      this.previewUrl = this.userData.profilePic;
    }
    if (this.studentData?.photos?.length) {
      this.photoPreviews = this.studentData.photos;
    }
    if (this.studentData?.courses?.length) {
      this.studentData.courses.forEach(c =>
        this.addCourse(c.course, c.batchYear, c.status)
      );
    } else {
      this.addCourse();
    }
  }

  get f() {
    return this.studentForm.controls;
  }

  get address() {
    return (this.studentForm.get('address') as FormGroup).controls;
  }

  get courses(): FormArray {
    return this.studentForm.get('courses') as FormArray;
  }

  addCourse(course: string = '', batchYear: number | null = null, status: string = 'active') {
    this.courses.push(
      this.fb.group({
        course: [course, Validators.required],
        batchYear: [batchYear, Validators.required],
        status: [status]
      })
    );
  }

  removeCourse(index: number) {
    this.courses.removeAt(index);
  }

  //for Profile
  onFileSelect(event: any) {
    if (event.files && event.files.length) {
      this.studentForm.patchValue({ profilePic: event.files[0] });
      this.previewUrl = '';
    }
  }

  onFileDeSelect(event: any) {
    this.studentForm.patchValue({profilePic: null});    
  }

  // Multiple Photos for docs
  onPhotosSelect(event: any) {
    if (event.files && event.files.length) {
      const currentPhotos = this.studentForm.get('photos')?.value || [];
      this.studentForm.patchValue({ photos: [...currentPhotos, ...event.files] });
    }
  }
  onPhotoRemove(index: number) {
    const photos = [...this.studentForm.get('photos')?.value];
    photos.splice(index, 1);
    this.studentForm.patchValue({ photos });
    this.photoPreviews.splice(index, 1); // remove preview
  }

  saveStudent() {
    const formData = new FormData();
    const formValue = this.studentForm.value;

    // normal fields
    if(formValue.userId) {
      formData.append('userId', formValue.userId);
    }
    formData.append('name', formValue.name);
    formData.append('email', formValue.email);
    formData.append('rollNo', formValue.rollNo);
    formData.append('enrollmentNo', formValue.enrollmentNo);
    formData.append('dob', formValue.dob);
    formData.append('gender', formValue.gender);
    formData.append('phone', formValue.phone);
    formData.append('guardianName', formValue.guardianName);
    formData.append('guardianContact', formValue.guardianContact);

    // nested objects / arrays → stringify
    formData.append('address', JSON.stringify(formValue.address));
    formData.append('courses', JSON.stringify(formValue.courses));

    // files (single profilePic)
    if (formValue.profilePic) {
      formData.append('profilePic', formValue.profilePic);
    }

    // multiple photos
    if (formValue.photos && formValue.photos.length) {
      formValue.photos.forEach((file: File) => {
        formData.append('photos', file);
      });
    }

    // Call service
    if (this.isEditMode) {
      this.studentService.updateStudent(this.studentData!._id!, formData).subscribe(()=>{
        this.router.navigate(['/common/student-list']);
      });
    } else {
      this.studentService.createStudent(formData).subscribe(()=>{
        this.router.navigate(['/common/student-list']);
      });
    }
  }

  onCancel() {
    this.router.navigate(['/common/student-list']);
  }
}
