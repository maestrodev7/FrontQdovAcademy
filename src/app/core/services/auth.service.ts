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
  private API_URL = `${environment.baseUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<any> {
    const payload = { username, password };
    return this.http.post<any>(`${this.API_URL}/login`, payload).pipe(
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

  sendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/send-otp`, { email });
  }

  verifyOtp(email: string, code: string, purpose: string = 'PASSWORD_RESET'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/verify-otp`, {
      email,
      code,
      purpose
    }).pipe(
      tap((response) => {
        // Si un token est retourné, le sauvegarder
        if (response?.data?.token) {
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          if (response.data.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          }
        }
      })
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/reset-password`, {
      email,
      newPassword
    });
  }
}
