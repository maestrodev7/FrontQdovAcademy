import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { AddStudentComponent } from '../add-student/add-student.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../classroom/ui/dynamic-table/dynamic-table.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
    standalone: true,
    imports: [
      NzButtonModule,
      AddStudentComponent,
      NzModalModule,
      NzGridModule,
      NzDividerModule,
      ReactiveFormsModule,
      CommonModule,
      DynamicTableComponent,
    ],
})
export class StudentsComponent implements OnInit {

    isModalVisible = false;
    isSubmitting = false;
    studentForm!: FormGroup;
    students: any[] = [];
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
    this.loadStudents();
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
      parentId: ['', Validators.required]
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.formError = '';
    this.studentForm.reset();
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.studentForm.reset();
  }

  onFormChange(formValue: any): void {
    this.studentForm.patchValue(formValue);
  }

submitForm(): void {
  // Marquer tous les champs comme touchés pour afficher les erreurs
  Object.keys(this.studentForm.controls).forEach(key => {
    this.studentForm.get(key)?.markAsTouched();
  });

  if (this.studentForm.invalid) {
    this.formError = 'Veuillez remplir tous les champs requis correctement.';
    return;
  }

  this.isSubmitting = true;
  this.formError = '';
  const payload = this.studentForm.value;

  this.userService.createStudentAndLinkParent(payload).subscribe({
    next: (res) => {
      const newStudent = {
        id: res.data?.id || payload.username,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: 'ELEVE',
      };

      this.students = [newStudent, ...this.students];
      
      this.message.success('Élève créé avec succès !');
      this.isSubmitting = false;
      this.isModalVisible = false;
      this.studentForm.reset();
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
    return 'Une erreur est survenue lors de la création de l\'élève.';
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
         (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue lors de la création de l\'élève.');
}

private getFieldLabel(fieldName: string): string {
  const labels: { [key: string]: string } = {
    'firstName': 'Prénom',
    'lastName': 'Nom',
    'username': 'Nom d\'utilisateur',
    'email': 'Email',
    'phoneNumber': 'Téléphone',
    'password': 'Mot de passe',
    'parentId': 'Parent'
  };
  return labels[fieldName] || fieldName;
}

private loadStudents(): void {
  this.userService.getStudents().subscribe({
    next: (res) => {
      this.students = (res.data?.content ?? []).map((student: any) => ({
        id: student.id,
        fullName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        phoneNumber: student.phoneNumber,
        role: student.roles?.join(', ') || 'ELEVE',
      }));
    },
    error: (err) => {
      console.error('Erreur de chargement des parents:', err);
    },
  });
}
}
