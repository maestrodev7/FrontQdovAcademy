import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { School } from '../interfaces/school';
import { Term, CreateTermRequest, UpdateTermRequest } from '../interfaces/term';
import { Sequence, CreateSequenceRequest, UpdateSequenceRequest } from '../interfaces/sequence';
@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private SCHOOL_API = `${environment.baseUrl}/schools`;
  private ACADEMIC_YEAR_API = `${environment.baseUrl}/academic-years`;
  private TERMS_API = `${environment.baseUrl}/terms`;
  private SEQUENCES_API = `${environment.baseUrl}/sequences`;

  constructor(private http: HttpClient) {}

  getSchools() {
    return this.http.get<ApiResponse<School[]>>(`${this.SCHOOL_API}`);
  }


  createSchool(payload: any): Observable<any> {
    return this.http.post<any>(this.SCHOOL_API, payload);
  }

  getAcademicYears(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.ACADEMIC_YEAR_API);
  }

  getSchoolsByUserId(userId: string): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(`${environment.baseUrl}/user-schools/user/${userId}/schools`);
}


  createAcademicYear(payload: any): Observable<any> {
    return this.http.post<any>(this.ACADEMIC_YEAR_API, payload);
  }

  getSchoolById(id: string): Observable<ApiResponse<School>> {
    return this.http.get<ApiResponse<School>>(`${this.SCHOOL_API}/${id}`);
  }

  updateCurrentAcademicYear(schoolId: string, academicYearId: string): Observable<ApiResponse<School>> {
    return this.http.put<ApiResponse<School>>(
      `${this.SCHOOL_API}/${schoolId}/current-academic-year/${academicYearId}`,
      {}
    );
  }

  // Terms methods
  getTerms(): Observable<ApiResponse<Term[]>> {
    return this.http.get<ApiResponse<Term[]>>(this.TERMS_API);
  }

  getTermsByAcademicYear(academicYearId: string): Observable<ApiResponse<Term[]>> {
    return this.http.get<ApiResponse<Term[]>>(`${this.TERMS_API}?academicYearId=${academicYearId}`);
  }

  createTerm(payload: CreateTermRequest): Observable<ApiResponse<Term>> {
    return this.http.post<ApiResponse<Term>>(this.TERMS_API, payload);
  }

  updateTerm(id: string, payload: UpdateTermRequest): Observable<ApiResponse<Term>> {
    return this.http.put<ApiResponse<Term>>(`${this.TERMS_API}/${id}`, payload);
  }

  deleteTerm(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.TERMS_API}/${id}`);
  }

  // Sequences methods
  getSequences(): Observable<ApiResponse<Sequence[]>> {
    return this.http.get<ApiResponse<Sequence[]>>(this.SEQUENCES_API);
  }

  getSequencesByTerm(termId: string): Observable<ApiResponse<Sequence[]>> {
    return this.http.get<ApiResponse<Sequence[]>>(`${this.SEQUENCES_API}?termId=${termId}`);
  }

  createSequence(payload: CreateSequenceRequest): Observable<ApiResponse<Sequence>> {
    return this.http.post<ApiResponse<Sequence>>(this.SEQUENCES_API, payload);
  }

  updateSequence(id: string, payload: UpdateSequenceRequest): Observable<ApiResponse<Sequence>> {
    return this.http.put<ApiResponse<Sequence>>(`${this.SEQUENCES_API}/${id}`, payload);
  }

  deleteSequence(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.SEQUENCES_API}/${id}`);
  }
}
