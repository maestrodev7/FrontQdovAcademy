import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { RouterLink } from '@angular/router';

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
    NzInputModule,
    RouterLink
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
      
      // Vérifier si le mot de passe doit être changé
      if (user && user.passwordChanged === false) {
        // Rediriger vers le changement de mot de passe obligatoire
        this.router.navigate(['/auth/send-otp'], { 
          queryParams: { email: user.email, passwordChange: 'true' } 
        });
        return;
      }

      const role = Array.isArray(user?.roles) ? user.roles[0] : user?.role || user?.roles;
      localStorage.setItem('user', JSON.stringify(user));

      if (role === 'SUPER_ADMIN') {
        this.router.navigate(['/school/list']);

      } else if (role === 'ADMIN' || role === 'PROMOTEUR') {
        this.schoolService.getSchoolsByUserId(user.id).subscribe({
          next: (res: any) => {
            const schools = res?.data?.map((us: any) => us.school) || [];
            localStorage.setItem('userSchools', JSON.stringify(schools));
            this.router.navigate(['/school/list']);
          },
          error: (err) => {
            console.error('Erreur récupération écoles utilisateur :', err);
            this.router.navigate(['/school/add']);
          }
        });
      } else if (role === 'ENSEIGNANT' || role === 'TEACHER' || (typeof role === 'string' && (role.includes('ENSEIGNANT') || role.includes('TEACHER')))) {
        // Pour les enseignants, récupérer leur école et la sélectionner automatiquement
        this.loading = true;
        this.schoolService.getSchoolsByUserId(user.id).subscribe({
          next: (res: any) => {
            this.loading = false;
            const userSchools = res?.data || [];
            if (userSchools.length > 0) {
              // Prendre la première école associée à l'enseignant
              const school = userSchools[0].school || userSchools[0];
              if (school && school.id) {
                localStorage.setItem('schoolId', school.id);
                const schoolsArray = userSchools.map((us: any) => us.school || us);
                localStorage.setItem('userSchools', JSON.stringify(schoolsArray));
                this.router.navigate(['/dashboard']);
              } else {
                this.errorMessage = 'Aucune école associée à votre compte';
              }
            } else {
              this.errorMessage = 'Aucune école associée à votre compte';
            }
          },
          error: (err) => {
            this.loading = false;
            console.error('Erreur récupération école enseignant :', err);
            this.errorMessage = 'Impossible de récupérer votre école. Veuillez contacter l\'administrateur.';
          }
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
