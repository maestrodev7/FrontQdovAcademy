import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SchoolService } from '../../services/school.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-school',
  templateUrl: './add-school.component.html',
  styleUrls: ['./add-school.component.css'],
  standalone: true,
  imports: [
    NzSelectModule,
    NzModalModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzTimePickerModule,
    FormsModule,
    NzButtonModule,
    CommonModule
  ]
})
export class AddSchoolComponent implements OnInit {
  academicYears: any[] = [];
  isAcademicYearModalVisible = false;
  loading = false;
  private router = inject(Router);

  schoolForm!: FormGroup;
  academicYearForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private schoolService: SchoolService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForms();  // ⚡ Initialisation ici
    this.loadAcademicYears();
  }

  private initForms() {
    this.schoolForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      academicYearIds: [[] as string[]]
    });

    this.academicYearForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      active: [true]
    });
  }

  loadAcademicYears() {
    this.schoolService.getAcademicYears().subscribe({
      next: (res:any) => {
        this.academicYears = res.data;

      },
      error: () => this.message.error('Impossible de charger les années académiques')
    });
  }

  openAcademicYearModal() {
    this.isAcademicYearModalVisible = true;
  }

  submitAcademicYear() {
    if (this.academicYearForm.invalid) return;

    this.schoolService.createAcademicYear(this.academicYearForm.value).subscribe({
      next: (res: any) => {
        const year = res.data;

        const formattedYear = {
          ...year,
          startDate: year.startDate,
          endDate: year.endDate
        };

        this.academicYears.push(formattedYear);

        this.schoolForm.patchValue({ academicYearIds: [year.id] });
        this.isAcademicYearModalVisible = false;
        this.message.success('Année académique créée avec succès');
        this.router.navigate(['/school/list']);
      },
      error: () => this.message.error("Erreur lors de la création de l'année académique")
    });
  }


submitSchool() {
  if (this.schoolForm.invalid) return;
  console.log(this.schoolForm.value);

  const payload = {
    ...this.schoolForm.value,
    academicYearIds: [this.schoolForm.value.academicYearIds] // transforme en tableau
  };

  this.loading = true;
  this.schoolService.createSchool(payload).subscribe({
    next: () => {
      this.message.success("École créée avec succès");
      this.schoolForm.reset();
      this.loading = false;
    },
    error: () => {
      this.message.error("Erreur lors de la création de l'école");
      this.loading = false;
    }
  });
}

}
