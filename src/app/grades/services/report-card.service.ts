import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';
import { ReportCard } from '../interfaces/report-card.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportCardService {
  private REPORT_CARD_API = `${environment.baseUrl}/report-cards`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère le bulletin d'un élève pour un trimestre
   */
  getReportCardByTerm(
    studentId: string,
    classRoomId: string,
    academicYearId: string,
    termId: string
  ): Observable<ApiResponse<ReportCard>> {
    const url = `${this.REPORT_CARD_API}/student/${studentId}/class/${classRoomId}/academic-year/${academicYearId}/term/${termId}`;
    console.log('[ReportCardService] GET ReportCard by Term:', {
      url,
      studentId,
      classRoomId,
      academicYearId,
      termId
    });
    return this.http.get<ApiResponse<ReportCard>>(url);
  }

  /**
   * Récupère le bulletin d'un élève pour une séquence
   */
  getReportCardBySequence(
    studentId: string,
    classRoomId: string,
    academicYearId: string,
    sequenceId: string
  ): Observable<ApiResponse<ReportCard>> {
    const url = `${this.REPORT_CARD_API}/student/${studentId}/class/${classRoomId}/academic-year/${academicYearId}/sequence/${sequenceId}`;
    console.log('[ReportCardService] GET ReportCard by Sequence:', {
      url,
      studentId,
      classRoomId,
      academicYearId,
      sequenceId
    });
    return this.http.get<ApiResponse<ReportCard>>(url);
  }
}
