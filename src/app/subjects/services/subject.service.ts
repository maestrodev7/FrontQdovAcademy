import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private SUBJECT_API = `${environment.baseUrl}/subjects`;

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.SUBJECT_API);
  }

  getSubjectById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.SUBJECT_API}/${id}`);
  }

  getSubjectsByClassroom(classroomId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.SUBJECT_API}/classroom/${classroomId}`);
  }

  createSubject(payload: { code: string; name: string; description?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.SUBJECT_API, payload);
  }

  updateSubject(id: string, payload: { code: string; name: string; description?: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.SUBJECT_API}/${id}`, payload);
  }

  deleteSubject(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.SUBJECT_API}/${id}`);
  }
}

