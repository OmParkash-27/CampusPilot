import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class HttpService {
     private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  
  put(formData: FormData, model: string, id: string, route?: string): Observable<any> {
        return this.http.put(`${this.API_URL + '/' + model + `${route ? route : ''}` + '/' + id}`, formData, { withCredentials: true });
  }
  post(formData: FormData, model: string ): Observable<any> {
    return this.http.post(`${this.API_URL + '/' + model }`, formData, { withCredentials: true });
  }

  getAll(model: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL + '/' + model }`, { withCredentials: true });
  } 

  getById(model: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL + '/' + model + "/" + id}`, { withCredentials: true });
  }

  get(route: string) {
    return this.http.get<any>(`${this.API_URL + '/' + route }`, { withCredentials: true });
  }

  deleteById(model: string, id: string) {
    return this.http.delete<any>(`${this.API_URL + '/' + model + '/' + id}`, { withCredentials: true })
  }

}
