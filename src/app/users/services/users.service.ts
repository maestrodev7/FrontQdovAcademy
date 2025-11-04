import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable, switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private USER_API = `${environment.baseUrl}/users`;
  private USER_SCHOOL_API = `${environment.baseUrl}/user-schools`;
  private PARENT_ELEVES_API = `${environment.baseUrl}/parent-eleves`;
  constructor(private http: HttpClient) {}

  createUser(payload: any): Observable<any> {
    return this.http.post<any>(this.USER_API, payload);
  }

  getParents(): Observable<any> {
    return this.http.get<any>(`${this.USER_API}?role=PARENT`);
  }
  getStudents(): Observable<any> {
    return this.http.get<any>(`${this.USER_API}?role=ELEVE`);
  }

  getTeachersBySchool(schoolId: string): Observable<any> {
    return this.http.get(`${this.USER_SCHOOL_API}/school/${schoolId}/teachers`);
  }

  assignUserToSchool(userId: string, schoolId: string, role: string = 'ADMIN'): Observable<any> {
    const payload = { userId, schoolId, role };
    return this.http.post<any>(this.USER_SCHOOL_API, payload);
  }

  getSchoolsWithAdmins(): Observable<any> {
    return this.http.get<any>(`${this.USER_SCHOOL_API}/schools-with-admins`);
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

    createTeacherForSchool(payload: any): Observable<any> {
    const userPayload = { ...payload, roles: ['ENSEIGNANT'] };
    console.log(userPayload);

    return this.createUser(userPayload).pipe(
      switchMap((res: any) => {
        const userId = res.data?.id || res.id;
        const schoolId = payload.schoolId;
        return this.assignUserToSchool(userId, schoolId, 'ENSEIGNANT');
      })
    );
  }

  linkParentToStudent(parentId: string, eleveId: string): Observable<any> {
    const payload = { parentId, eleveId };
    return this.http.post<any>(this.PARENT_ELEVES_API, payload);
  }

  createStudentAndLinkParent(payload: any): Observable<any> {
    const { parentId, ...userPayload } = payload;
    const finalUserPayload = { ...userPayload, roles: ['ELEVE'] };

    return this.createUser(finalUserPayload).pipe(
        switchMap((studentCreationResponse: any) => {
            const eleveId = studentCreationResponse.data?.id || studentCreationResponse.id;

            if (!eleveId || !parentId) {
                return [studentCreationResponse];
            }

            return this.linkParentToStudent(parentId, eleveId).pipe(
                map(() => studentCreationResponse)
            );
        })
    );
  }
}
