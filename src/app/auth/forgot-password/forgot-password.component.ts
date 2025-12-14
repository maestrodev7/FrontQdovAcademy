import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../core/services/auth.service';

type ContactMethod = 'email' | 'sms' | 'whatsapp';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule
  ]
})
export class ForgotPasswordComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  loading = false;
  errorMessage = '';
  selectedMethod: ContactMethod = 'email'; // Email par défaut

  form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email])
  });

  selectMethod(method: ContactMethod): void {
    this.selectedMethod = method;
    // Pour le moment, seul email fonctionne
    if (method !== 'email') {
      this.message.info('Cette méthode sera bientôt disponible');
      this.selectedMethod = 'email';
    }
  }

  submitForm(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const email = this.form.value.email;

    this.authService.sendOtp(email).subscribe({
      next: (response) => {
        this.loading = false;
        this.message.success('Code OTP envoyé avec succès !');
        // Rediriger vers la vérification OTP avec l'email
        this.router.navigate(['/auth/verify-otp'], {
          queryParams: { email, method: this.selectedMethod }
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

