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
  selector: 'app-send-otp',
  standalone: true,
  templateUrl: './send-otp.component.html',
  styleUrls: ['./send-otp.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule
  ]
})
export class SendOtpComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);

  loading = false;
  errorMessage = '';
  selectedMethod: 'email' | 'sms' | 'whatsapp' = 'email';
  email: string = '';
  isPasswordChange: boolean = false;

  sendOtpForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email])
  });

  ngOnInit(): void {
    // Vérifier si c'est pour un changement de mot de passe obligatoire
    this.route.queryParams.subscribe(params => {
      this.isPasswordChange = params['passwordChange'] === 'true';
      if (params['email']) {
        this.email = params['email'];
        this.sendOtpForm.patchValue({ email: params['email'] });
      }
    });
  }

  selectMethod(method: 'email' | 'sms' | 'whatsapp'): void {
    this.selectedMethod = method;
  }

  sendOtp(): void {
    if (this.sendOtpForm.invalid) {
      Object.values(this.sendOtpForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.email = this.sendOtpForm.value.email || '';

    const payload: any = {};
    
    if (this.selectedMethod === 'email') {
      payload.email = this.email;
    } else if (this.selectedMethod === 'sms') {
      payload.phoneNumber = this.email; // Dans ce cas, c'est un numéro de téléphone
    } else if (this.selectedMethod === 'whatsapp') {
      payload.phoneNumber = this.email; // Dans ce cas, c'est un numéro de téléphone
    }

    this.http.post<any>(`${environment.baseUrl}/auth/send-otp`, payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.message.success('Code OTP envoyé avec succès !');
        // Rediriger vers la vérification OTP
        this.router.navigate(['/auth/verify-otp'], {
          queryParams: {
            email: this.email,
            method: this.selectedMethod,
            passwordChange: this.isPasswordChange ? 'true' : 'false'
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l\'envoi du code OTP.';
        this.message.error(this.errorMessage);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}

