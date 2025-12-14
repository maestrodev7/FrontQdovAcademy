import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class TeacherSubjectService {
  private getSchoolApi(schoolId: string): string {
    return `${environment.baseUrl}/schools/${schoolId}/teacher-subjects`;
  }

  constructor(private http: HttpClient) {}

  create(schoolId: string, payload: {
    userSchoolId: string;
    subjectId: string;
    schoolId?: string;
    specialization?: string;
    experienceYears?: number;
  }): Observable<ApiResponse<any>> {
    // S'assurer que schoolId est inclus dans le payload
    const finalPayload = { ...payload, schoolId };
    return this.http.post<ApiResponse<any>>(this.getSchoolApi(schoolId), finalPayload);
  }

  getAllBySchool(schoolId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.getSchoolApi(schoolId));
  }

  getByAcademicYear(schoolId: string, academicYearId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/academic-year/${academicYearId}`);
  }

  getById(schoolId: string, id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.getSchoolApi(schoolId)}/${id}`);
  }

  getByTeacher(schoolId: string, userSchoolId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/teacher/${userSchoolId}`);
  }

  getBySubject(schoolId: string, subjectId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/subject/${subjectId}`);
  }

  update(schoolId: string, id: string, payload: {
    schoolId?: string;
    subjectId?: string;
    specialization?: string;
    experienceYears?: number;
  }): Observable<ApiResponse<any>> {
    // S'assurer que schoolId est inclus dans le payload
    const finalPayload = { ...payload, schoolId };
    return this.http.put<ApiResponse<any>>(`${this.getSchoolApi(schoolId)}/${id}`, finalPayload);
  }

  delete(schoolId: string, id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.getSchoolApi(schoolId)}/${id}`);
  }
}

