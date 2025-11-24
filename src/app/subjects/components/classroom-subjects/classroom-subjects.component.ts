import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DynamicTableComponent } from '../../../classroom/ui/dynamic-table/dynamic-table.component';
import { ClassroomService } from '../../../classroom/services/classroom.service';
import { SubjectService } from '../../services/subject.service';
import { ClassroomSubjectService } from '../../services/classroom-subject.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-classroom-subjects',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzSelectModule,
    NzInputNumberModule,
    DynamicTableComponent,
  ],
  templateUrl: './classroom-subjects.component.html',
  styleUrls: ['./classroom-subjects.component.css']
})
export class ClassroomSubjectsComponent implements OnInit {
  classrooms: any[] = [];
  subjects: any[] = [];
  selectedClassroomId: string | null = null;
  classroomSubjects: any[] = [];
  loading = false;

  isModalVisible = false;
  isSubmitting = false;
  associationForm!: FormGroup;
  formError: string = '';
  editingAssociation: any = null;

  columns = [
    { key: 'subjectName', label: 'Matière' },
    { key: 'subjectCode', label: 'Code' },
    { key: 'coefficient', label: 'Coefficient' },
  ];

  constructor(
    private fb: FormBuilder,
    private classroomService: ClassroomService,
    private subjectService: SubjectService,
    private classroomSubjectService: ClassroomSubjectService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClassrooms();
    this.loadSubjects();
  }

  private initForm(): void {
    this.associationForm = this.fb.group({
      subjectId: ['', Validators.required],
      coefficient: [1, [Validators.required, Validators.min(0.1)]],
    });
  }

  loadClassrooms(): void {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) {
      this.message.warning('Aucune école sélectionnée');
      return;
    }

    this.loading = true;
    this.classroomService.getClassroomsBySchool(schoolId).subscribe({
      next: (res) => {
        this.classrooms = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes:', err);
        this.message.error('Impossible de charger les classes');
        this.loading = false;
      }
    });
  }

  loadSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({
      next: (res) => {
        this.subjects = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des matières:', err);
        this.message.error('Impossible de charger les matières');
      }
    });
  }

  onClassroomChange(classroomId: string): void {
    this.selectedClassroomId = classroomId;
    if (classroomId) {
      this.loadClassroomSubjects(classroomId);
    } else {
      this.classroomSubjects = [];
    }
  }

  loadClassroomSubjects(classroomId: string): void {
    this.loading = true;
    this.classroomSubjectService.getByClassroom(classroomId).subscribe({
      next: (res) => {
        this.classroomSubjects = (res.data || []).map((cs: any) => ({
          id: cs.id,
          subjectId: cs.subject?.id || cs.subjectId,
          subjectName: cs.subject?.name || '',
          subjectCode: cs.subject?.code || '',
          coefficient: cs.coefficient || 1
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des matières de la classe:', err);
        this.message.error('Impossible de charger les matières de la classe');
        this.loading = false;
        this.classroomSubjects = [];
      }
    });
  }

  openModal(): void {
    if (!this.selectedClassroomId) {
      this.message.warning('Veuillez sélectionner une classe d\'abord');
      return;
    }
    this.editingAssociation = null;
    this.associationForm.reset({ coefficient: 1 });
    this.formError = '';
    this.isModalVisible = true;
  }

  openEditModal(association: any): void {
    this.editingAssociation = association;
    this.associationForm.patchValue({
      subjectId: association.subjectId,
      coefficient: association.coefficient
    });
    this.formError = '';
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.editingAssociation = null;
    this.associationForm.reset({ coefficient: 1 });
  }

  submitForm(): void {
    if (!this.selectedClassroomId) {
      this.formError = 'Veuillez sélectionner une classe.';
      return;
    }

    // Marquer tous les champs comme touchés
    Object.keys(this.associationForm.controls).forEach(key => {
      this.associationForm.get(key)?.markAsTouched();
    });

    if (this.associationForm.invalid) {
      this.formError = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    const payload = {
      subjectId: this.associationForm.value.subjectId,
      classRoomId: this.selectedClassroomId,
      coefficient: this.associationForm.value.coefficient
    };

    if (this.editingAssociation) {
      // Mise à jour
      this.classroomSubjectService.updateAssociation(this.editingAssociation.id, { coefficient: payload.coefficient }).subscribe({
        next: (res) => {
          this.message.success('Association mise à jour avec succès !');
          this.isSubmitting = false;
          this.isModalVisible = false;
          this.handleCancel();
          this.loadClassroomSubjects(this.selectedClassroomId!);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      // Création
      this.classroomSubjectService.createAssociation(payload).subscribe({
        next: (res) => {
          const newAssociation = {
            id: res.data?.id,
            subjectId: payload.subjectId,
            subjectName: this.subjects.find(s => s.id === payload.subjectId)?.name || '',
            subjectCode: this.subjects.find(s => s.id === payload.subjectId)?.code || '',
            coefficient: payload.coefficient
          };

          this.classroomSubjects = [newAssociation, ...this.classroomSubjects];

          this.message.success('Matière associée à la classe avec succès !');
          this.isSubmitting = false;
          this.isModalVisible = false;
          this.handleCancel();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  deleteAssociation(association: any): void {
    if (!this.selectedClassroomId) return;

    this.classroomSubjectService.deleteByClassroomAndSubject(this.selectedClassroomId, association.subjectId).subscribe({
      next: () => {
        this.classroomSubjects = this.classroomSubjects.filter(cs => cs.id !== association.id);
        this.message.success('Association supprimée avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        const errorMessage = this.extractErrorMessage(err);
        this.message.error(errorMessage);
      }
    });
  }

  private handleError(err: any): void {
    console.error('❌ Erreur :', err);
    this.isSubmitting = false;
    
    const errorMessage = this.extractErrorMessage(err);
    
    this.formError = errorMessage;
    this.message.error(errorMessage);
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) {
      return 'Une erreur est survenue.';
    }

    const errorObj = err.error;

    if (typeof errorObj === 'object' && !errorObj.message && !errorObj.error) {
      const messages: string[] = [];

      Object.keys(errorObj).forEach((key) => {
        const errorValue = errorObj[key];

        if (typeof errorValue === 'string') {
          messages.push(`${this.mapFieldLabel(key)}: ${errorValue}`);
        } else if (Array.isArray(errorValue)) {
          messages.push(`${this.mapFieldLabel(key)}: ${errorValue.join(', ')}`);
        }
      });

      if (messages.length) {
        return messages.join('\n');
      }
    }

    return errorObj.message || errorObj.error || (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue.');
  }

  private mapFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      subjectId: 'Matière',
      classRoomId: 'Classe',
      coefficient: 'Coefficient',
    };
    return labels[field] || field;
  }

  getSelectedClassroomName(): string {
    if (!this.selectedClassroomId) return '';
    const classroom = this.classrooms.find(c => c.id === this.selectedClassroomId);
    return classroom?.label || '';
  }

  getAvailableSubjects(): any[] {
    if (!this.selectedClassroomId) return this.subjects;
    // Filtrer les matières déjà associées (sauf celle en cours d'édition)
    const associatedSubjectIds = this.classroomSubjects
      .filter(cs => !this.editingAssociation || cs.id !== this.editingAssociation.id)
      .map(cs => cs.subjectId);
    return this.subjects.filter(s => !associatedSubjectIds.includes(s.id));
  }
}

