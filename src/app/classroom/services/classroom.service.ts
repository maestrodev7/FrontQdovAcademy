import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private CLASSROOM_API = `${environment.baseUrl}/classrooms`;

  constructor(private http: HttpClient) {}

  getClassroomsBySchool(schoolId: string) {
    return this.http.get<ApiResponse<any[]>>(`${this.CLASSROOM_API}/school/${schoolId}`);
  }


  createClassroom(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.CLASSROOM_API, payload);
  }

  getClassroomById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.CLASSROOM_API}/${id}`);
  }

  updateClassroom(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.CLASSROOM_API}/${id}`, payload);
  }

  deleteClassroom(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CLASSROOM_API}/${id}`);
  }
}
