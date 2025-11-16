import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { Registration, CreateRegistrationRequest } from '../interfaces/registration.interface';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  constructor(private http: HttpClient) {}

  createRegistration(payload: CreateRegistrationRequest): Observable<ApiResponse<Registration>> {
    return this.http.post<ApiResponse<Registration>>(
      `${environment.baseUrl}/registrations`,
      payload
    );
  }

  getRegistrationsByStudent(studentId: string): Observable<ApiResponse<Registration[]>> {
    return this.http.get<ApiResponse<Registration[]>>(
      `${environment.baseUrl}/registrations/student/${studentId}`
    );
  }

  getRegistrationsByClass(classRoomId: string): Observable<ApiResponse<Registration[]>> {
    return this.http.get<ApiResponse<Registration[]>>(
      `${environment.baseUrl}/registrations/class/${classRoomId}`
    );
  }

  getRegistrationsBySchool(schoolId: string): Observable<ApiResponse<Registration[]>> {
    return this.http.get<ApiResponse<Registration[]>>(
      `${environment.baseUrl}/registrations/school/${schoolId}`
    );
  }
}

