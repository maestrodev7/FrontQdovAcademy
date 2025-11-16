import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { PaymentPlan, CreatePaymentPlanRequest } from '../interfaces/payment-plan.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentPlanService {
  constructor(private http: HttpClient) {}

  getPaymentPlansBySchool(schoolId: string): Observable<ApiResponse<PaymentPlan[]>> {
    return this.http.get<ApiResponse<PaymentPlan[]>>(
      `${environment.baseUrl}/schools/${schoolId}/payment-plans`
    );
  }

  createPaymentPlan(schoolId: string, payload: CreatePaymentPlanRequest): Observable<ApiResponse<PaymentPlan>> {
    return this.http.post<ApiResponse<PaymentPlan>>(
      `${environment.baseUrl}/schools/${schoolId}/payment-plans`,
      payload
    );
  }

  deletePaymentPlan(schoolId: string, planId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.baseUrl}/schools/${schoolId}/payment-plans/${planId}`
    );
  }
}

