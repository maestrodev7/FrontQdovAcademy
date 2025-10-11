import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private USER_API = `${environment.baseUrl}/users`;
  private USER_SCHOOL_API = `${environment.baseUrl}/user-schools`;

  constructor(private http: HttpClient) {}

  createUser(payload: any): Observable<any> {
    return this.http.post<any>(this.USER_API, payload);
  }

  assignUserToSchool(userId: string, schoolId: string, role: string = 'ADMIN'): Observable<any> {
    const payload = { userId, schoolId, role };
    return this.http.post<any>(this.USER_SCHOOL_API, payload);
  }

  createAdminForSchool(payload: any): Observable<any> {
    const userPayload = { ...payload, roles: ['ADMIN'] };

    return this.createUser(userPayload).pipe(
      switchMap((res: any) => {
        const userId = res.data?.id || res.id;
        const schoolId = payload.schoolId;
        return this.assignUserToSchool(userId, schoolId, 'ADMIN');
      })
    );
  }
}
