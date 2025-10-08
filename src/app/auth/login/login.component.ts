import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';

import { AuthService } from '../../core/services/auth.service';
import { SchoolService } from '../../school/services/school.service';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule
  ]
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private schoolService = inject(SchoolService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  validateForm = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
    remember: this.fb.control(true),
  });

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.validateForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading = false;

        const user = this.authService.getUser();
        const role = Array.isArray(user?.roles) ? user.roles[0] : user?.role;

        if (role === 'SUPER_ADMIN') {
          this.schoolService.getSchools().subscribe({
            next: (res:any) => {
              const schools = res?.data || [];
              if (schools.length > 0) {
                this.router.navigate(['/school/list']);
              } else {
                this.router.navigate(['/school/add']);
              }
            },
            error: (err:any) => {
              console.error('Erreur récupération écoles :', err);
              this.router.navigate(['/school/add']);
            },
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Échec de la connexion. Vérifiez vos identifiants.';
        console.error('Erreur login', err);
      },
    });
  }
}
