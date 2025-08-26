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
  photosRemoveUrls:string[]= [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
  this.studentForm = this.fb.group({
    userId: [''],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    profilePic: [null],
    photos: [[]],
    rollNo: ['', Validators.required],
    enrollmentNo: [''],
    dob: [null],
    gender: [''],
    phone: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
    }),
    guardianName: [''],
    guardianContact: [''],
    courses: this.fb.array([]),
  });

  const userId = this.route.snapshot.paramMap.get('userId');
  const studentId = this.route.snapshot.paramMap.get('studentId');

  if (studentId) {
    this.isEditMode = true;
    this.loadStudent(studentId);
  } else if (userId) {
    this.isPartialAdd = true;
    this.loadUser(userId);
  } else {
    this.addCourse(); // kam se kam ek course blank
  }
}

  private loadUser(userId: string) {
    this.userService.getUserById(userId).subscribe(user => {
      this.userData = user;
      this.studentForm.patchValue({
      name: this.userData?.name,
      email: this.userData?.email
      })
      if (this.userData?.profilePic) {
        this.previewUrl = this.userData.profilePic;
      }
    });
  }

  private loadStudent(studentId: string) {
    this.studentService.getStudentById(studentId).subscribe(student => {
    this.studentData = student;
    this.userData = student.user as any;

    this.studentForm.patchValue({
      userId: (this.studentData?.user as any)?._id,
      name: this.userData?.name,
      email: this.userData?.email,
      rollNo: this.studentData?.rollNo,
      enrollmentNo: this.studentData?.enrollmentNo,
      dob: this.studentData?.dob ? new Date(this.studentData.dob) : null,
      gender: this.studentData?.gender,
      phone: this.studentData?.phone,
      address: this.studentData?.address,
      guardianName: this.studentData?.guardianName,
      guardianContact: this.studentData?.guardianContact,
    });

    // reset courses formArray
    this.courses.clear();
    if (this.studentData?.courses?.length) {
      this.studentData.courses.forEach(c =>
        this.addCourse(c.course, new Date(c.batchYear,0,1), c.status)
      );
    } else {
      this.addCourse();
    }

    if (this.studentData.user?.profilePic) {
      this.previewUrl = this.studentData?.user?.profilePic;
    }
    if (this.studentData?.photos?.length) {
      this.photoPreviews = this.studentData.photos;
    }
  });
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

  addCourse(course: string = '', batchYear: Date | null = null, status: string = 'active') {
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
    if (event.files[0].size > 1000000){
      event.currentFiles.splice(event.currentFiles.indexOf(event.files[0]), 1);
      return;
    } 
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
    const maxSize = 1000000; // 1 MB
    const validFiles: File[] = [];

    if (event.files && event.files.length) {
      event.files.forEach((file: File) => {
        if (file.size <= maxSize) {
          validFiles.push(file);
        } 
      });

      // Patch only valid files
      const currentPhotos = this.studentForm.get('photos')?.value || [];
      this.studentForm.patchValue({ photos: [...currentPhotos, ...validFiles] });
    }
  }


  //for deselect photo
  onRemoveFile(event: any) {
    if(event.file) {
      const currentPhotos = this.studentForm.get('photos')?.value || [];
      const updatedPhotos = currentPhotos.filter((photo: File) => photo !== event.file);
      this.studentForm.patchValue({ photos: updatedPhotos });
      console.log("after remove file", updatedPhotos);
    }
  }

  //for old photos from backend
  onOldPhotoRemove(photoUrl: string, index: number) {
    this.studentData?.photos?.splice(index, 1);
    // this.studentData?.photos?.length ? this.photoPreviews = this.studentData?.photos : this.photoPreviews = [];
    this.photosRemoveUrls.push(photoUrl);
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

    // data in formData always should be string to send on server
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
      formData.append("deletePhotosUrls", JSON.stringify(this.photosRemoveUrls));

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
