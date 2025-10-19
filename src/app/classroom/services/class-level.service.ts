import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class ClassLevelService {
  private CLASS_LEVEL_API = `${environment.baseUrl}/class-levels`;

  constructor(private http: HttpClient) {}

  getClassLevels(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.CLASS_LEVEL_API);
  }

  createClassLevel(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.CLASS_LEVEL_API, payload);
  }

  getClassLevelById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.CLASS_LEVEL_API}/${id}`);
  }

  updateClassLevel(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.CLASS_LEVEL_API}/${id}`, payload);
  }

  deleteClassLevel(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CLASS_LEVEL_API}/${id}`);
  }
}
