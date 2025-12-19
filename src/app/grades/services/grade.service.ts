import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { Grade, CreateGradeRequest, UpdateGradeRequest } from '../interfaces/grade.interface';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private GRADE_API = `${environment.baseUrl}/grades`;

  constructor(private http: HttpClient) {}

  createGrade(payload: CreateGradeRequest): Observable<ApiResponse<Grade>> {
    return this.http.post<ApiResponse<Grade>>(this.GRADE_API, payload);
  }

  getGradesByStudentAndTerm(studentId: string, termId: string): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${this.GRADE_API}/student/${studentId}/term/${termId}`);
  }

  getGradesByStudentAndSequence(studentId: string, sequenceId: string): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${this.GRADE_API}/student/${studentId}/sequence/${sequenceId}`);
  }

  getGradeById(id: string): Observable<ApiResponse<Grade>> {
    return this.http.get<ApiResponse<Grade>>(`${this.GRADE_API}/${id}`);
  }

  updateGrade(id: string, payload: UpdateGradeRequest): Observable<ApiResponse<Grade>> {
    return this.http.put<ApiResponse<Grade>>(`${this.GRADE_API}/${id}`, payload);
  }

  deleteGrade(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.GRADE_API}/${id}`);
  }

  getGradesByCompetenceAndTerm(competenceId: string, termId: string): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${this.GRADE_API}/competence/${competenceId}/term/${termId}`);
  }

  getGradesByCompetenceAndSequence(competenceId: string, sequenceId: string): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${this.GRADE_API}/competence/${competenceId}/sequence/${sequenceId}`);
  }
}

