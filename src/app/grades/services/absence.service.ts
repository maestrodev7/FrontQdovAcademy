import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { 
  Absence, 
  CreateAbsenceRequest, 
  UpdateAbsenceRequest,
  AbsenceDateRangeParams,
  TotalHoursParams,
  TotalHoursResponse
} from '../interfaces/absence.interface';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private ABSENCE_API = `${environment.baseUrl}/absences`;

  constructor(private http: HttpClient) {}

  /**
   * Enregistrer les absences
   * POST /api/absences
   */
  createAbsence(payload: CreateAbsenceRequest): Observable<ApiResponse<Absence>> {
    return this.http.post<ApiResponse<Absence>>(this.ABSENCE_API, payload);
  }

  /**
   * Récupérer une absence par ID
   * GET /api/absences/{id}
   */
  getAbsenceById(id: string): Observable<ApiResponse<Absence>> {
    return this.http.get<ApiResponse<Absence>>(`${this.ABSENCE_API}/${id}`);
  }

  /**
   * Récupérer les absences d'un élève pour une période
   * GET /api/absences/student/{studentId}/date-range?startDate=2025-12-01&endDate=2025-12-31
   */
  getAbsencesByStudentAndDateRange(
    studentId: string, 
    params: AbsenceDateRangeParams
  ): Observable<ApiResponse<Absence[]>> {
    const httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);
    
    return this.http.get<ApiResponse<Absence[]>>(
      `${this.ABSENCE_API}/student/${studentId}/date-range`,
      { params: httpParams }
    );
  }

  /**
   * Récupérer le total d'heures d'absence d'un élève pour une période
   * GET /api/absences/student/{studentId}/total-hours?startDate=2025-12-01&endDate=2025-12-31
   */
  getTotalAbsenceHoursByStudent(
    studentId: string, 
    params: TotalHoursParams
  ): Observable<ApiResponse<TotalHoursResponse>> {
    const httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);
    
    return this.http.get<ApiResponse<TotalHoursResponse>>(
      `${this.ABSENCE_API}/student/${studentId}/total-hours`,
      { params: httpParams }
    );
  }

  /**
   * Récupérer les absences d'une classe pour une matière et une date
   * GET /api/absences/class/{classRoomId}/subject/{subjectId}/date/2025-12-19
   */
  getAbsencesByClassSubjectAndDate(
    classRoomId: string, 
    subjectId: string, 
    date: string
  ): Observable<ApiResponse<Absence[]>> {
    return this.http.get<ApiResponse<Absence[]>>(
      `${this.ABSENCE_API}/class/${classRoomId}/subject/${subjectId}/date/${date}`
    );
  }

  /**
   * Récupérer toutes les absences d'une classe
   * GET /api/absences/class/{classRoomId}
   */
  getAbsencesByClass(classRoomId: string): Observable<ApiResponse<Absence[]>> {
    return this.http.get<ApiResponse<Absence[]>>(
      `${this.ABSENCE_API}/class/${classRoomId}`
    );
  }

  /**
   * Récupérer toutes les absences d'une matière
   * GET /api/absences/subject/{subjectId}
   */
  getAbsencesBySubject(subjectId: string): Observable<ApiResponse<Absence[]>> {
    return this.http.get<ApiResponse<Absence[]>>(
      `${this.ABSENCE_API}/subject/${subjectId}`
    );
  }

  /**
   * Récupérer toutes les absences d'une école
   * GET /api/absences/school/{schoolId}
   */
  getAbsencesBySchool(schoolId: string): Observable<ApiResponse<Absence[]>> {
    return this.http.get<ApiResponse<Absence[]>>(
      `${this.ABSENCE_API}/school/${schoolId}`
    );
  }

  /**
   * Mettre à jour une absence
   * PUT /api/absences/{id}
   */
  updateAbsence(id: string, payload: UpdateAbsenceRequest): Observable<ApiResponse<Absence>> {
    return this.http.put<ApiResponse<Absence>>(`${this.ABSENCE_API}/${id}`, payload);
  }

  /**
   * Supprimer une absence
   * DELETE /api/absences/{id}
   */
  deleteAbsence(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.ABSENCE_API}/${id}`);
  }
}

