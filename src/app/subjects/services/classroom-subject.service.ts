import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class ClassroomSubjectService {
  private CLASSROOM_SUBJECT_API = `${environment.baseUrl}/classroom-subjects`;

  constructor(private http: HttpClient) {}

  createAssociation(payload: { subjectId: string; classRoomId: string; coefficient: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.CLASSROOM_SUBJECT_API, payload);
  }

  getByClassroom(classRoomId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.CLASSROOM_SUBJECT_API}/classroom/${classRoomId}`);
  }

  getBySubject(subjectId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.CLASSROOM_SUBJECT_API}/subject/${subjectId}`);
  }

  getByClassroomAndSubject(classRoomId: string, subjectId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.CLASSROOM_SUBJECT_API}/classroom/${classRoomId}/subject/${subjectId}`);
  }

  updateAssociation(id: string, payload: { coefficient: number }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.CLASSROOM_SUBJECT_API}/${id}`, payload);
  }

  deleteAssociation(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CLASSROOM_SUBJECT_API}/${id}`);
  }

  deleteByClassroomAndSubject(classRoomId: string, subjectId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CLASSROOM_SUBJECT_API}/classroom/${classRoomId}/subject/${subjectId}`);
  }
}

