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
  selector: 'app-verify-otp',
  standalone: true,
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule
  ]
})
export class VerifyOtpComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);

  loading = false;
  errorMessage = '';
  email: string = '';
  method: string = 'email';
  isPasswordChange: boolean = false;
  purpose: string = 'PASSWORD_RESET';

  verifyOtpForm = this.fb.group({
    otp: this.fb.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(6)])
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.method = params['method'] || 'email';
      this.isPasswordChange = params['passwordChange'] === 'true';
      this.purpose = this.isPasswordChange ? 'ACCOUNT_CREATION' : 'PASSWORD_RESET';
    });
  }

  verifyOtp(): void {
    if (this.verifyOtpForm.invalid) {
      Object.values(this.verifyOtpForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload: any = {
      email: this.email,
      code: this.verifyOtpForm.value.otp,
      purpose: this.purpose
    };

    this.http.post<any>(`${environment.baseUrl}/auth/verify-otp`, payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.message.success('Code OTP vérifié avec succès !');
        
        // Rediriger vers la réinitialisation du mot de passe
        this.router.navigate(['/auth/reset-password'], {
          queryParams: {
            email: this.email,
            passwordChange: this.isPasswordChange ? 'true' : 'false',
            token: response.data?.token || ''
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Code OTP invalide.';
        this.message.error(this.errorMessage);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/send-otp'], {
      queryParams: {
        email: this.email,
        passwordChange: this.isPasswordChange ? 'true' : 'false'
      }
    });
  }

  resendOtp(): void {
    const payload: any = {};
    if (this.method === 'email') {
      payload.email = this.email;
    } else {
      payload.phoneNumber = this.email;
    }

    this.http.post<any>(`${environment.baseUrl}/auth/send-otp`, payload).subscribe({
      next: () => {
        this.message.success('Code OTP renvoyé avec succès !');
      },
      error: (err) => {
        this.message.error(err?.error?.message || 'Erreur lors du renvoi du code OTP.');
      }
    });
  }
}
