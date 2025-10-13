import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_KEY = 'auth_token';
  private USER_KEY = 'auth_user';
  private API_URL = `${environment.baseUrl}/auth/login`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<any> {
    const payload = { username, password };
    return this.http.post<any>(this.API_URL, payload).pipe(
      tap((response) => {
        if (response?.data?.token) {
          localStorage.clear();
          sessionStorage.clear();
          localStorage.setItem(this.TOKEN_KEY, response.data.token);

          if (response.data.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
