import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private getSchoolApi(schoolId: string): string {
    return `${environment.baseUrl}/schools/${schoolId}/schedules`;
  }

  constructor(private http: HttpClient) {}

  create(schoolId: string, payload: {
    classRoomId: string;
    classRoomSubjectId?: string;
    subjectId?: string;
    teacherSubjectId: string;
    schoolId?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room?: string;
    notes?: string;
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

  getByClassroom(schoolId: string, classRoomId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/classroom/${classRoomId}`);
  }

  getByClassroomAndDay(schoolId: string, classRoomId: string, dayOfWeek: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/classroom/${classRoomId}/day/${dayOfWeek}`);
  }

  getByTeacher(schoolId: string, teacherSubjectId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/teacher/${teacherSubjectId}`);
  }

  getByTeacherAndDay(schoolId: string, teacherSubjectId: string, dayOfWeek: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.getSchoolApi(schoolId)}/teacher/${teacherSubjectId}/day/${dayOfWeek}`);
  }

  update(schoolId: string, id: string, payload: {
    schoolId?: string;
    subjectId?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room?: string;
    notes?: string;
  }): Observable<ApiResponse<any>> {
    // S'assurer que schoolId est inclus dans le payload
    const finalPayload = { ...payload, schoolId };
    return this.http.put<ApiResponse<any>>(`${this.getSchoolApi(schoolId)}/${id}`, finalPayload);
  }

  delete(schoolId: string, id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.getSchoolApi(schoolId)}/${id}`);
  }

  deleteByClassroom(schoolId: string, classRoomId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.getSchoolApi(schoolId)}/classroom/${classRoomId}`);
  }
}

