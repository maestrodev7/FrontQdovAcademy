import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TeacherSubjectService } from '../../services/teacher-subject.service';
import { SubjectService } from '../../services/subject.service';
import { UsersService } from '../../../users/services/users.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-subjects',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzSpinModule,
  ],
  templateUrl: './teacher-subjects.component.html',
  styleUrls: ['./teacher-subjects.component.css']
})
export class TeacherSubjectsComponent implements OnInit {
  teachers: any[] = [];
  subjects: any[] = [];
  teacherSubjects: any[] = [];
  loading = false;
  schoolId: string | null = null;

  isModalVisible = false;
  isSubmitting = false;
  associationForm!: FormGroup;
  formError: string = '';
  editingAssociation: any = null;

  constructor(
    private fb: FormBuilder,
    private teacherSubjectService: TeacherSubjectService,
    private subjectService: SubjectService,
    private usersService: UsersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.schoolId = localStorage.getItem('schoolId');
    if (!this.schoolId) {
      this.message.warning('Aucune école sélectionnée');
      return;
    }
    this.initForm();
    this.loadTeachers();
    this.loadSubjects();
    this.loadTeacherSubjects();
  }

  private initForm(): void {
    this.associationForm = this.fb.group({
      userSchoolId: ['', Validators.required],
      subjectId: ['', Validators.required],
      specialization: [''],
      experienceYears: [0, [Validators.min(0)]],
    });
  }

  loadTeachers(): void {
    if (!this.schoolId) return;
    this.loading = true;
    this.usersService.getTeachersBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.teachers = (res.data || []).map((teacher: any) => ({
          id: teacher.userSchoolId || teacher.id,
          userSchoolId: teacher.userSchoolId || teacher.id,
          fullName: `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.trim(),
          email: teacher.user?.email || '',
          phoneNumber: teacher.user?.phoneNumber || ''
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des enseignants:', err);
        this.message.error('Impossible de charger les enseignants');
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

  loadTeacherSubjects(): void {
    if (!this.schoolId) return;
    this.loading = true;
    this.teacherSubjectService.getAllBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.teacherSubjects = (res.data || []).map((ts: any) => ({
          id: ts.id,
          userSchoolId: ts.userSchoolId,
          subjectId: ts.subjectId,
          subjectName: ts.subject?.name || '',
          subjectCode: ts.subject?.code || '',
          teacherName: ts.teacher ? `${ts.teacher.firstName} ${ts.teacher.lastName}` : '',
          specialization: ts.specialization || '',
          experienceYears: ts.experienceYears || 0
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des associations:', err);
        this.message.error('Impossible de charger les associations');
        this.loading = false;
        this.teacherSubjects = [];
      }
    });
  }

  openModal(): void {
    this.editingAssociation = null;
    this.associationForm.reset({ experienceYears: 0 });
    this.formError = '';
    this.isModalVisible = true;
  }

  openEditModal(association: any): void {
    this.editingAssociation = association;
    this.associationForm.patchValue({
      userSchoolId: association.userSchoolId,
      subjectId: association.subjectId,
      specialization: association.specialization,
      experienceYears: association.experienceYears
    });
    this.formError = '';
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.editingAssociation = null;
    this.associationForm.reset({ experienceYears: 0 });
  }

  submitForm(): void {
    if (!this.schoolId) {
      this.formError = 'Aucune école sélectionnée.';
      return;
    }

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
      userSchoolId: this.associationForm.value.userSchoolId,
      subjectId: this.associationForm.value.subjectId,
      schoolId: this.schoolId,
      specialization: this.associationForm.value.specialization || undefined,
      experienceYears: this.associationForm.value.experienceYears || undefined
    };

    if (this.editingAssociation) {
      this.teacherSubjectService.update(this.schoolId, this.editingAssociation.id, {
        schoolId: this.schoolId,
        subjectId: this.editingAssociation.subjectId,
        specialization: payload.specialization,
        experienceYears: payload.experienceYears
      }).subscribe({
        next: (res) => {
          this.message.success('Association mise à jour avec succès !');
          this.isSubmitting = false;
          this.isModalVisible = false;
          this.handleCancel();
          this.loadTeacherSubjects();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      this.teacherSubjectService.create(this.schoolId, payload).subscribe({
        next: (res) => {
          const newAssociation = {
            id: res.data?.id,
            userSchoolId: payload.userSchoolId,
            subjectId: payload.subjectId,
            subjectName: this.subjects.find(s => s.id === payload.subjectId)?.name || '',
            subjectCode: this.subjects.find(s => s.id === payload.subjectId)?.code || '',
            teacherName: this.teachers.find(t => t.userSchoolId === payload.userSchoolId)?.fullName || '',
            specialization: payload.specialization || '',
            experienceYears: payload.experienceYears || 0
          };

          this.teacherSubjects = [newAssociation, ...this.teacherSubjects];

          this.message.success('Association créée avec succès !');
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
    if (!this.schoolId) return;

    this.teacherSubjectService.delete(this.schoolId, association.id).subscribe({
      next: () => {
        this.teacherSubjects = this.teacherSubjects.filter(ts => ts.id !== association.id);
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
      userSchoolId: 'Enseignant',
      subjectId: 'Matière',
      specialization: 'Spécialisation',
      experienceYears: 'Années d\'expérience',
    };
    return labels[field] || field;
  }

  getAvailableSubjects(): any[] {
    if (!this.editingAssociation) return this.subjects;
    // Filtrer les matières déjà associées (sauf celle en cours d'édition)
    const associatedSubjectIds = this.teacherSubjects
      .filter(ts => ts.id !== this.editingAssociation.id)
      .map(ts => ts.subjectId);
    return this.subjects.filter(s => !associatedSubjectIds.includes(s.id));
  }
}

