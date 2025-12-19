import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { DisciplineRecord, CreateDisciplineRecordRequest, UpdateDisciplineRecordRequest } from '../interfaces/discipline-record.interface';

@Injectable({
  providedIn: 'root'
})
export class DisciplineRecordService {
  private DISCIPLINE_RECORD_API = `${environment.baseUrl}/discipline-records`;

  constructor(private http: HttpClient) {}

  createDisciplineRecord(payload: CreateDisciplineRecordRequest): Observable<ApiResponse<DisciplineRecord>> {
    return this.http.post<ApiResponse<DisciplineRecord>>(this.DISCIPLINE_RECORD_API, payload);
  }

  getDisciplineRecordByStudentAndTerm(studentId: string, termId: string): Observable<ApiResponse<DisciplineRecord>> {
    return this.http.get<ApiResponse<DisciplineRecord>>(`${this.DISCIPLINE_RECORD_API}/student/${studentId}/term/${termId}`);
  }

  getDisciplineRecordById(id: string): Observable<ApiResponse<DisciplineRecord>> {
    return this.http.get<ApiResponse<DisciplineRecord>>(`${this.DISCIPLINE_RECORD_API}/${id}`);
  }

  updateDisciplineRecord(id: string, payload: UpdateDisciplineRecordRequest): Observable<ApiResponse<DisciplineRecord>> {
    return this.http.put<ApiResponse<DisciplineRecord>>(`${this.DISCIPLINE_RECORD_API}/${id}`, payload);
  }

  deleteDisciplineRecord(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.DISCIPLINE_RECORD_API}/${id}`);
  }
}

