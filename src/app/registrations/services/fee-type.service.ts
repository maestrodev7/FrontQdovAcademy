import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { FeeType, CreateFeeTypeRequest } from '../interfaces/fee-type.interface';

@Injectable({
  providedIn: 'root'
})
export class FeeTypeService {
  constructor(private http: HttpClient) {}

  getFeeTypesBySchool(schoolId: string): Observable<ApiResponse<FeeType[]>> {
    return this.http.get<ApiResponse<FeeType[]>>(
      `${environment.baseUrl}/schools/${schoolId}/fee-types`
    );
  }

  createFeeType(schoolId: string, payload: CreateFeeTypeRequest): Observable<ApiResponse<FeeType>> {
    return this.http.post<ApiResponse<FeeType>>(
      `${environment.baseUrl}/schools/${schoolId}/fee-types`,
      payload
    );
  }

  deleteFeeType(schoolId: string, feeTypeId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.baseUrl}/schools/${schoolId}/fee-types/${feeTypeId}`
    );
  }
}

