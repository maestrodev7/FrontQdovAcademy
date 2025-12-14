import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);

  loading = false;
  errorMessage = '';
  email: string = '';
  isPasswordChange: boolean = false;

  resetPasswordForm = this.fb.group({
    newPassword: this.fb.control('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: this.fb.control('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(group: any) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.isPasswordChange = params['passwordChange'] === 'true';
    });
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      Object.values(this.resetPasswordForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      email: this.email,
      newPassword: this.resetPasswordForm.value.newPassword
    };

    this.http.post<any>(`${environment.baseUrl}/auth/reset-password`, payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.message.success('Mot de passe réinitialisé avec succès !');
        // Rediriger vers la connexion
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la réinitialisation du mot de passe.';
        this.message.error(this.errorMessage);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/verify-otp'], {
      queryParams: {
        email: this.email,
        passwordChange: this.isPasswordChange ? 'true' : 'false'
      }
    });
  }
}

