import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/common/http.service';

@Injectable({ providedIn: 'root' })
export class UploadFilesService {

  constructor(private httpService: HttpService) {}

  getUploadedFiles(): Observable<any> {
    return this.httpService.get('dashboard/student');
  }

  uploadDocs(formData: FormData): Observable<any> {
    return this.httpService.putWithoutId(formData, 'students'); 
  }
}
