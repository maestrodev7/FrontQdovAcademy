import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private SERIES_API = `${environment.baseUrl}/series`;

  constructor(private http: HttpClient) {}

  getSeries(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.SERIES_API);
  }

  createSeries(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.SERIES_API, payload);
  }

  getSeriesById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.SERIES_API}/${id}`);
  }

  updateSeries(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.SERIES_API}/${id}`, payload);
  }

  deleteSeries(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.SERIES_API}/${id}`);
  }
}
