import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { School } from '../interfaces/school';
@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private SCHOOL_API = `${environment.baseUrl}/schools`;
  private ACADEMIC_YEAR_API = `${environment.baseUrl}/academic-years`;

  constructor(private http: HttpClient) {}

  // --- Schools ---
  getSchools() {
    return this.http.get<ApiResponse<School[]>>(`${this.SCHOOL_API}`);
  }


  createSchool(payload: any): Observable<any> {
    return this.http.post<any>(this.SCHOOL_API, payload);
  }

  // --- Academic Years ---
  getAcademicYears(): Observable<any[]> {
    return this.http.get<any[]>(this.ACADEMIC_YEAR_API);
  }

  createAcademicYear(payload: any): Observable<any> {
    return this.http.post<any>(this.ACADEMIC_YEAR_API, payload);
  }
}
