import { Component, inject, model, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { UploadFilesService } from './upload-student.service';
import { environment } from '../../../../environments/environment';
import { FileUploadModule } from 'primeng/fileupload';
import { Student } from '../../../core/models/Student';
import { GalleriaModule } from 'primeng/galleria';
import { Router } from '@angular/router';
@Component({
  selector: 'app-upload-student-files',
  imports: [CarouselModule, ButtonModule, FileUploadModule, GalleriaModule ],
  templateUrl: './upload-student-files.html',
  styleUrl: './upload-student-files.scss'
})
export class UploadStudentFiles implements OnInit {
  fileService = inject(UploadFilesService);
  router = inject(Router);
  student: WritableSignal<Student | null> = signal(null);
  photos = model<any[]>([]);
  responsiveOptions: any[] | undefined;
  API_URL = environment.apiUrl;
  selectedPhotos: any = [];

  displayCustom: boolean | undefined;
  activeIndex: number = 0;

  ngOnInit() {
      this.responsiveOptions = [
            {
                breakpoint: '1400px',
                numVisible: 5
            },
            {
                breakpoint: '1199px',
                numVisible: 4
            },
            {
                breakpoint: '767px',
                numVisible: 3
            },
            {
                breakpoint: '575px',
                numVisible: 1
            }
        ];
        this.fileService.getUploadedFiles().subscribe((res)=> {
          this.student.set(res);      
          this.photos.set(res.photos);    
        })
  }

  imageClick(index: number) {
        this.activeIndex = index;
        this.displayCustom = true;
  }

  onUpload(event: any) {
    const formData = new FormData();
    if (!event.files || event.files.length === 0) return;
    for (let file of event.files) {
      formData.append('photos', file);
    }
    this.fileService.uploadDocs(formData).subscribe({
      next: () => this.router.navigate(['student/dashboard']),
      error: (err) => console.log("Error uploading files ---", err)
    });
  }

}
