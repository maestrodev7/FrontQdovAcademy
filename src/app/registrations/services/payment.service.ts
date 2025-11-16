import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { Payment, CreatePaymentRequest } from '../interfaces/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  createPayment(registrationId: string, payload: CreatePaymentRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(
      `${environment.baseUrl}/registrations/${registrationId}/payments`,
      payload
    );
  }

  getPaymentsByRegistration(registrationId: string): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(
      `${environment.baseUrl}/registrations/${registrationId}/payments`
    );
  }
}

