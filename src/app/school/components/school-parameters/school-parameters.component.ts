import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { SchoolService } from '../../services/school.service';
import { School } from '../../interfaces/school';
import { AcademicYear } from '../../interfaces/academic-year';
import { Term, CreateTermRequest } from '../../interfaces/term';
import { Sequence, CreateSequenceRequest } from '../../interfaces/sequence';

@Component({
  selector: 'app-school-parameters',
  standalone: true,
  templateUrl: './school-parameters.component.html',
  styleUrls: ['./school-parameters.component.css'],
  imports: [
    CommonModule,
    NzCardModule,
    NzSpinModule,
    NzButtonModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzTableModule,
    NzIconModule,
    NzTabsModule,
    NzDividerModule,
    NzPopconfirmModule,
  ],
})
export class SchoolParametersComponent implements OnInit {
  loading = true;
  school: School | null = null;
  selectedAcademicYearId: string | null = null;
  formError = '';
  saving = false;
  academicYears: AcademicYear[] = [];
  academicYearsLoading = true;

  isYearModalVisible = false;
  yearForm!: FormGroup;
  yearModalLoading = false;

  // Terms and Sequences
  terms: Term[] = [];
  sequences: Sequence[] = [];
  termsLoading = false;
  sequencesLoading = false;
  
  isTermModalVisible = false;
  termForm!: FormGroup;
  termModalLoading = false;
  editingTerm: Term | null = null;

  isSequenceModalVisible = false;
  sequenceForm!: FormGroup;
  sequenceModalLoading = false;
  editingSequence: Sequence | null = null;
  selectedTermForSequence: Term | null = null;

  // Configuration
  configForm!: FormGroup;
  numberOfTerms = 3;
  numberOfSequencesPerTerm = 2;
  
  activeTabIndex = 0;

  constructor(
    private schoolService: SchoolService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initYearForm();
    this.initTermForm();
    this.initSequenceForm();
    this.initConfigForm();
    this.loadAcademicYears();
    this.loadSchool();
  }

  private initYearForm(): void {
    this.yearForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  private loadSchool(): void {
    this.loading = true;
    this.formError = '';

    const schoolId =
      localStorage.getItem('schoolId') ||
      this.getFirstSchoolIdFromStorage();

    if (!schoolId) {
      this.loading = false;
      this.formError = 'Aucune école sélectionnée. Veuillez en sélectionner une depuis la liste des écoles.';
      return;
    }

    this.schoolService.getSchoolById(schoolId).subscribe({
      next: (res) => {
        this.school = res.data;
        this.syncSelectedAcademicYear();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.formError = this.extractErrorMessage(err);
      },
    });
  }

  private loadAcademicYears(): void {
    this.academicYearsLoading = true;
    this.schoolService.getAcademicYears().subscribe({
      next: (res) => {
        this.academicYears = res.data ?? [];
        this.academicYearsLoading = false;
        this.syncSelectedAcademicYear();
      },
      error: (err) => {
        this.academicYearsLoading = false;
        const error = this.extractErrorMessage(err);
        this.message.error(error);
      },
    });
  }

  private syncSelectedAcademicYear(): void {
    if (this.school?.academicYears?.length) {
      const active = this.school.academicYears.find((year) => year.active);
      if (active) {
        this.selectedAcademicYearId = active.id;
        this.loadTerms();
        return;
      }
    }

    if (!this.selectedAcademicYearId && this.academicYears.length > 0) {
      this.selectedAcademicYearId = this.academicYears[0].id;
      this.loadTerms();
    }
  }

  onAcademicYearChange(): void {
    this.loadTerms();
  }

  saveCurrentAcademicYear(): void {
    if (!this.school) {
      this.formError = 'Aucune école chargée.';
      return;
    }

    if (!this.selectedAcademicYearId) {
      this.formError = 'Veuillez sélectionner une année académique.';
      return;
    }

    this.saving = true;
    this.formError = '';

    this.schoolService
      .updateCurrentAcademicYear(this.school.id, this.selectedAcademicYearId)
      .subscribe({
        next: (res) => {
          this.school = res.data;
          this.selectedAcademicYearId =
            this.school?.academicYears?.find((year) => year.active)?.id || null;
          this.message.success(res.message || 'Année académique mise à jour.');
          this.saving = false;
        },
        error: (err) => {
          this.saving = false;
          this.formError = this.extractErrorMessage(err);
          this.message.error(this.formError);
        },
      });
  }

  openYearModal(): void {
    this.isYearModalVisible = true;
    this.yearModalLoading = false;
    this.yearForm.reset();
  }

  handleYearModalCancel(): void {
    this.isYearModalVisible = false;
  }

  submitYearForm(): void {
    Object.values(this.yearForm.controls).forEach((control) => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });

    if (this.yearForm.invalid) {
      return;
    }

    this.yearModalLoading = true;
    this.schoolService.createAcademicYear(this.yearForm.value).subscribe({
      next: (res) => {
        this.message.success(res.message || "Année académique créée avec succès");
        this.academicYears = [res.data, ...this.academicYears];
        this.yearModalLoading = false;
        this.isYearModalVisible = false;

        if (!this.selectedAcademicYearId) {
          this.selectedAcademicYearId = res.data.id;
        }
      },
      error: (err) => {
        this.yearModalLoading = false;
        const errorMessage = this.extractErrorMessage(err);
        this.message.error(errorMessage);
      },
    });
  }

  private getFirstSchoolIdFromStorage(): string | null {
    try {
      const schools = JSON.parse(localStorage.getItem('userSchools') || '[]');
      const first = Array.isArray(schools) ? schools[0] : null;
      if (first?.schoolId || first?.id) {
        const id = first.schoolId || first.id;
        localStorage.setItem('schoolId', id);
        return id;
      }
      return null;
    } catch (error) {
      return null;
    }
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

    return (
      errorObj.message ||
      errorObj.error ||
      (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue.')
    );
  }

  private mapFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      academicYearId: 'Année académique',
      schoolId: 'École',
    };
    return labels[field] || field;
  }

  // Terms Management
  private initTermForm(): void {
    this.termForm = this.fb.group({
      name: ['', Validators.required],
      number: [1, [Validators.required, Validators.min(1)]],
      academicYearId: ['', Validators.required],
      schoolId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  private initSequenceForm(): void {
    this.sequenceForm = this.fb.group({
      name: ['', Validators.required],
      number: [1, [Validators.required, Validators.min(1)]],
      termId: ['', Validators.required],
      schoolId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  private initConfigForm(): void {
    this.configForm = this.fb.group({
      numberOfTerms: [3, [Validators.required, Validators.min(1), Validators.max(12)]],
      numberOfSequencesPerTerm: [2, [Validators.required, Validators.min(1), Validators.max(12)]],
    });
  }

  loadTerms(): void {
    if (!this.selectedAcademicYearId) {
      this.terms = [];
      return;
    }

    this.termsLoading = true;
    this.schoolService.getTermsByAcademicYear(this.selectedAcademicYearId).subscribe({
      next: (res) => {
        this.terms = res.data ?? [];
        this.termsLoading = false;
      },
      error: (err) => {
        this.termsLoading = false;
        const error = this.extractErrorMessage(err);
        this.message.error(error);
      },
    });
  }

  loadSequences(termIdOrTerm?: string | Term): void {
    if (termIdOrTerm) {
      if (typeof termIdOrTerm === 'string') {
        this.selectedTermForSequence = this.terms.find(t => t.id === termIdOrTerm) || null;
      } else {
        this.selectedTermForSequence = termIdOrTerm;
      }
    }

    if (!this.selectedTermForSequence?.id) {
      this.sequences = [];
      return;
    }

    this.sequencesLoading = true;
    this.schoolService.getSequencesByTerm(this.selectedTermForSequence.id).subscribe({
      next: (res) => {
        this.sequences = res.data ?? [];
        this.sequencesLoading = false;
      },
      error: (err) => {
        this.sequencesLoading = false;
        const error = this.extractErrorMessage(err);
        this.message.error(error);
      },
    });
  }

  openTermModal(term?: Term): void {
    this.editingTerm = term || null;
    this.isTermModalVisible = true;
    this.termModalLoading = false;

    if (term) {
      // Edit mode
      this.termForm.patchValue({
        name: term.name,
        number: term.number,
        academicYearId: term.academicYearId,
        schoolId: term.schoolId,
        startDate: term.startDate,
        endDate: term.endDate,
      });
    } else {
      // Create mode
      this.termForm.reset({
        number: 1,
        academicYearId: this.selectedAcademicYearId || '',
        schoolId: this.school?.id || '',
      });
    }
  }

  handleTermModalCancel(): void {
    this.isTermModalVisible = false;
    this.editingTerm = null;
    this.termForm.reset();
  }

  submitTermForm(): void {
    Object.values(this.termForm.controls).forEach((control) => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });

    if (this.termForm.invalid) {
      return;
    }

    this.termModalLoading = true;
    const payload: CreateTermRequest = this.termForm.value;

    if (this.editingTerm) {
      // Update
      this.schoolService.updateTerm(this.editingTerm.id, payload).subscribe({
        next: (res) => {
          this.message.success(res.message || 'Trimestre mis à jour avec succès');
          this.loadTerms();
          this.termModalLoading = false;
          this.isTermModalVisible = false;
          this.editingTerm = null;
        },
        error: (err) => {
          this.termModalLoading = false;
          const errorMessage = this.extractErrorMessage(err);
          this.message.error(errorMessage);
        },
      });
    } else {
      // Create
      this.schoolService.createTerm(payload).subscribe({
        next: (res) => {
          this.message.success(res.message || 'Trimestre créé avec succès');
          this.loadTerms();
          this.termModalLoading = false;
          this.isTermModalVisible = false;
        },
        error: (err) => {
          this.termModalLoading = false;
          const errorMessage = this.extractErrorMessage(err);
          this.message.error(errorMessage);
        },
      });
    }
  }

  deleteTerm(term: Term): void {
    this.schoolService.deleteTerm(term.id).subscribe({
      next: (res) => {
        this.message.success(res.message || 'Trimestre supprimé avec succès');
        this.loadTerms();
      },
      error: (err) => {
        const errorMessage = this.extractErrorMessage(err);
        this.message.error(errorMessage);
      },
    });
  }

  openSequenceModal(sequence?: Sequence): void {
    this.editingSequence = sequence || null;
    this.isSequenceModalVisible = true;
    this.sequenceModalLoading = false;

    if (sequence) {
      // Edit mode
      const term = this.terms.find(t => t.id === sequence.termId);
      this.selectedTermForSequence = term || null;
      this.sequenceForm.patchValue({
        name: sequence.name,
        number: sequence.number,
        termId: sequence.termId,
        schoolId: sequence.schoolId,
        startDate: sequence.startDate,
        endDate: sequence.endDate,
      });
      this.loadSequences(sequence.termId);
    } else {
      // Create mode
      if (!this.selectedTermForSequence) {
        this.message.warning('Veuillez sélectionner un trimestre d\'abord');
        this.isSequenceModalVisible = false;
        return;
      }
      this.sequenceForm.reset({
        number: 1,
        termId: this.selectedTermForSequence.id,
        schoolId: this.school?.id || '',
      });
    }
  }

  handleSequenceModalCancel(): void {
    this.isSequenceModalVisible = false;
    this.editingSequence = null;
    this.sequenceForm.reset();
  }

  submitSequenceForm(): void {
    Object.values(this.sequenceForm.controls).forEach((control) => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });

    if (this.sequenceForm.invalid) {
      return;
    }

    this.sequenceModalLoading = true;
    const payload: CreateSequenceRequest = this.sequenceForm.value;

    if (this.editingSequence) {
      // Update
      this.schoolService.updateSequence(this.editingSequence.id, payload).subscribe({
        next: (res) => {
          this.message.success(res.message || 'Séquence mise à jour avec succès');
          this.loadSequences(this.selectedTermForSequence?.id);
          this.sequenceModalLoading = false;
          this.isSequenceModalVisible = false;
          this.editingSequence = null;
        },
        error: (err) => {
          this.sequenceModalLoading = false;
          const errorMessage = this.extractErrorMessage(err);
          this.message.error(errorMessage);
        },
      });
    } else {
      // Create
      this.schoolService.createSequence(payload).subscribe({
        next: (res) => {
          this.message.success(res.message || 'Séquence créée avec succès');
          this.loadSequences(this.selectedTermForSequence?.id);
          this.sequenceModalLoading = false;
          this.isSequenceModalVisible = false;
        },
        error: (err) => {
          this.sequenceModalLoading = false;
          const errorMessage = this.extractErrorMessage(err);
          this.message.error(errorMessage);
        },
      });
    }
  }

  deleteSequence(sequence: Sequence): void {
    this.schoolService.deleteSequence(sequence.id).subscribe({
      next: (res) => {
        this.message.success(res.message || 'Séquence supprimée avec succès');
        this.loadSequences(this.selectedTermForSequence?.id);
      },
      error: (err) => {
        const errorMessage = this.extractErrorMessage(err);
        this.message.error(errorMessage);
      },
    });
  }

  saveConfig(): void {
    if (this.configForm.invalid) {
      return;
    }
    this.numberOfTerms = this.configForm.value.numberOfTerms;
    this.numberOfSequencesPerTerm = this.configForm.value.numberOfSequencesPerTerm;
    this.message.success('Configuration enregistrée');
  }
}

