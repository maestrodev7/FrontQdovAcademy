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

import { SchoolService } from '../../services/school.service';
import { School } from '../../interfaces/school';
import { AcademicYear } from '../../interfaces/academic-year';

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

  constructor(
    private schoolService: SchoolService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initYearForm();
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
        return;
      }
    }

    if (!this.selectedAcademicYearId && this.academicYears.length > 0) {
      this.selectedAcademicYearId = this.academicYears[0].id;
    }
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
}

