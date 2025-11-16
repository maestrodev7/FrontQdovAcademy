import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { ClassFee, CreateClassFeeRequest } from '../interfaces/class-fee.interface';

@Injectable({
  providedIn: 'root'
})
export class ClassFeeService {
  constructor(private http: HttpClient) {}

  getClassFeesBySchool(schoolId: string, classRoomId?: string): Observable<ApiResponse<ClassFee[]>> {
    let url = `${environment.baseUrl}/schools/${schoolId}/class-fees`;
    if (classRoomId) {
      url += `?classRoomId=${classRoomId}`;
    }
    return this.http.get<ApiResponse<ClassFee[]>>(url);
  }

  createClassFee(schoolId: string, payload: CreateClassFeeRequest): Observable<ApiResponse<ClassFee>> {
    return this.http.post<ApiResponse<ClassFee>>(
      `${environment.baseUrl}/schools/${schoolId}/class-fees`,
      payload
    );
  }

  deleteClassFee(schoolId: string, classFeeId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.baseUrl}/schools/${schoolId}/class-fees/${classFeeId}`
    );
  }
}

