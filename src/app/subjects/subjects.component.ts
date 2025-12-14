import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../classroom/ui/dynamic-table/dynamic-table.component';
import { SubjectService } from './services/subject.service';
import { AddSubjectComponent } from './components/add-subject/add-subject.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    AddSubjectComponent,
    NzModalModule,
    NzButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  subjectForm!: FormGroup;
  formError: string = '';

  subjectsList: any[] = [];
  columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description' },
  ];
  isTeacher = false;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkUserRole();
    this.loadSubjects();
  }

  private checkUserRole(): void {
    const user = this.authService.getUser();
    if (user) {
      const role = Array.isArray(user.roles) ? user.roles[0] : user.role || user.roles;
      this.isTeacher = (typeof role === 'string' && (role.includes('ENSEIGNANT') || role.includes('TEACHER'))) ||
                       (typeof user.roles === 'string' && (user.roles.includes('ENSEIGNANT') || user.roles.includes('TEACHER')));
    }
  }

  private initForm(): void {
    this.subjectForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.formError = '';
    this.subjectForm.reset();
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.subjectForm.reset();
  }

  onFormChange(value: any): void {
    this.subjectForm.patchValue(value);
  }

  submitForm(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.subjectForm.controls).forEach(key => {
      this.subjectForm.get(key)?.markAsTouched();
    });

    if (this.subjectForm.invalid) {
      this.formError = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    this.subjectService.createSubject(this.subjectForm.value).subscribe({
      next: (res) => {
        const newSubject = {
          id: res.data?.id,
          code: this.subjectForm.value.code,
          name: this.subjectForm.value.name,
          description: this.subjectForm.value.description || ''
        };

        this.subjectsList = [newSubject, ...this.subjectsList];

        this.message.success('Matière créée avec succès !');
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.subjectForm.reset();
        this.formError = '';
      },
      error: (err) => {
        console.error('❌ Erreur :', err);
        this.isSubmitting = false;
        
        // Extraire les messages d'erreur de l'API
        const errorMessage = this.extractErrorMessage(err);
        
        this.formError = errorMessage;
        this.message.error(errorMessage);
      }
    });
  }

  private loadSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({
      next: (res) => {
        this.subjectsList = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des matières:', err);
        this.message.error('Impossible de charger les matières');
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) {
      return 'Une erreur est survenue lors de la création de la matière.';
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
           (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue lors de la création de la matière.');
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'code': 'Code',
      'name': 'Nom',
      'description': 'Description'
    };
    return labels[fieldName] || fieldName;
  }
}

