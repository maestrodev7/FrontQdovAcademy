import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { Competence, CreateCompetenceRequest, UpdateCompetenceRequest } from '../interfaces/competence.interface';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  private COMPETENCE_API = `${environment.baseUrl}/competences`;

  constructor(private http: HttpClient) {}

  createCompetence(payload: CreateCompetenceRequest): Observable<ApiResponse<Competence>> {
    return this.http.post<ApiResponse<Competence>>(this.COMPETENCE_API, payload);
  }

  getCompetencesBySubject(subjectId: string): Observable<ApiResponse<Competence[]>> {
    return this.http.get<ApiResponse<Competence[]>>(`${this.COMPETENCE_API}/subject/${subjectId}`);
  }

  getCompetenceById(id: string): Observable<ApiResponse<Competence>> {
    return this.http.get<ApiResponse<Competence>>(`${this.COMPETENCE_API}/${id}`);
  }

  updateCompetence(id: string, payload: UpdateCompetenceRequest): Observable<ApiResponse<Competence>> {
    return this.http.put<ApiResponse<Competence>>(`${this.COMPETENCE_API}/${id}`, payload);
  }

  deleteCompetence(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.COMPETENCE_API}/${id}`);
  }
}

