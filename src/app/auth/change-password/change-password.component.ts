import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule
  ]
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);

  loading = false;
  errorMessage = '';
  email: string = '';
  isForced: boolean = false;

  form = this.fb.group({
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
      this.isForced = params['forced'] === 'true';
      
      if (!this.email) {
        // Si pas d'email dans les query params, essayer de le récupérer de l'utilisateur connecté
        const user = this.authService.getUser();
        if (user && user.email) {
          this.email = user.email;
          this.isForced = user.passwordChanged === false;
        } else {
          this.message.warning('Email non fourni');
          this.router.navigate(['/auth/login']);
        }
      }
    });
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

    const newPassword = this.form.value.newPassword;

    this.authService.resetPassword(this.email, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.message.success('Mot de passe réinitialisé avec succès !');
        
        // Si c'est un changement forcé, déconnecter et rediriger vers login
        if (this.isForced) {
          this.authService.logout();
          this.message.info('Veuillez vous reconnecter avec votre nouveau mot de passe');
        }
        
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la réinitialisation du mot de passe.';
        this.message.error(this.errorMessage);
      }
    });
  }

  goBack(): void {
    if (this.isForced) {
      this.message.warning('Vous devez changer votre mot de passe pour continuer');
      return;
    }
    this.router.navigate(['/auth/verify-otp'], {
      queryParams: { email: this.email }
    });
  }
}

