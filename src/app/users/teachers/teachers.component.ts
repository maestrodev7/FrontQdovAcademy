import { Component, OnInit } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users.service';
import { AddTeacherComponent } from '../add-teacher/add-teacher.component';
import { DynamicTableComponent } from '../../classroom/ui/dynamic-table/dynamic-table.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css'],
    standalone: true,
    imports: [
      NzButtonModule,
      AddTeacherComponent,
      NzModalModule,
      NzGridModule,
      NzDividerModule,
      ReactiveFormsModule,
      CommonModule,
      DynamicTableComponent,
    ],
})
export class TeachersComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  adminForm!: FormGroup;
  teachers: any[] = [];
  formError: string = '';

  columns = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
    this.adminForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
      schoolId: ['', Validators.required],
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.formError = '';
    this.adminForm.reset();
  }

  private loadTeachers(): void {
    const schoolId = localStorage.getItem('schoolId');
    console.log(schoolId);

    if (!schoolId) return;

    this.userService.getTeachersBySchool(schoolId).subscribe({
      next: (res) => {
        this.teachers = (res.data ?? []).map((teacher: any) => ({
          id: teacher.userId,
          fullName: `${teacher.user.firstName} ${teacher.user.lastName}`,
          email: teacher.user.email,
          phoneNumber: teacher.user.phoneNumber,
          role: teacher.role
        }));
      },
      error: (err) => {
      }
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.adminForm.reset();
  }

  onFormChange(formValue: any): void {
    this.adminForm.patchValue(formValue);
  }

  submitForm(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.adminForm.controls).forEach(key => {
      this.adminForm.get(key)?.markAsTouched();
    });

    if (this.adminForm.invalid) {
      this.formError = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';
    const payload = this.adminForm.value;

    this.userService.createTeacherForSchool(payload).subscribe({
      next: (res) => {
        const newTeacher = {
          id: res.data?.userId || payload.username,
          fullName: `${payload.firstName} ${payload.lastName}`,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          role: 'ENSEIGNANT'
        };

        this.teachers = [newTeacher, ...this.teachers];

        this.message.success('Enseignant créé avec succès !');
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.adminForm.reset();
        this.formError = '';
      },
      error: (err) => {
        console.error('❌ Erreur :', err);
        this.isSubmitting = false;
        
        // Extraire les messages d'erreur de l'API
        const errorMessage = this.extractErrorMessage(err);
        
        this.formError = errorMessage;
        this.message.error(errorMessage);
      },
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) {
      return 'Une erreur est survenue lors de la création de l\'enseignant.';
    }

    const errorObj = err.error;
    
    // Si c'est un objet avec des propriétés correspondant aux champs du formulaire
    if (typeof errorObj === 'object' && !errorObj.message && !errorObj.error) {
      const fieldErrors: string[] = [];
      
      // Parcourir toutes les propriétés de l'objet d'erreur
      Object.keys(errorObj).forEach(key => {
        const errorValue = errorObj[key];
        if (typeof errorValue === 'string') {
          // Mapper les noms de champs pour un affichage plus lisible
          const fieldName = this.getFieldLabel(key);
          fieldErrors.push(`${fieldName}: ${errorValue}`);
        } else if (Array.isArray(errorValue)) {
          // Si c'est un tableau de messages
          const fieldName = this.getFieldLabel(key);
          fieldErrors.push(`${fieldName}: ${errorValue.join(', ')}`);
        }
      });
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('\n');
      }
    }
    
    // Messages d'erreur généraux
    return errorObj.message || 
           errorObj.error || 
           (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue lors de la création de l\'enseignant.');
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'firstName': 'Prénom',
      'lastName': 'Nom',
      'username': 'Nom d\'utilisateur',
      'email': 'Email',
      'phoneNumber': 'Téléphone',
      'password': 'Mot de passe',
      'schoolId': 'École'
    };
    return labels[fieldName] || fieldName;
  }


}
