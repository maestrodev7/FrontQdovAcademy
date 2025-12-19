import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { StudentInfo, CreateStudentInfoRequest, UpdateStudentInfoRequest } from '../interfaces/student-info.interface';

@Injectable({
  providedIn: 'root'
})
export class StudentInfoService {
  private STUDENT_INFO_API = `${environment.baseUrl}/student-infos`;

  constructor(private http: HttpClient) {}

  createStudentInfo(payload: CreateStudentInfoRequest): Observable<ApiResponse<StudentInfo>> {
    return this.http.post<ApiResponse<StudentInfo>>(this.STUDENT_INFO_API, payload);
  }

  getStudentInfoByStudentId(studentId: string): Observable<ApiResponse<StudentInfo>> {
    return this.http.get<ApiResponse<StudentInfo>>(`${this.STUDENT_INFO_API}/student/${studentId}`);
  }

  updateStudentInfo(studentId: string, payload: UpdateStudentInfoRequest): Observable<ApiResponse<StudentInfo>> {
    return this.http.put<ApiResponse<StudentInfo>>(`${this.STUDENT_INFO_API}/student/${studentId}`, payload);
  }

  deleteStudentInfo(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.STUDENT_INFO_API}/${id}`);
  }
}

