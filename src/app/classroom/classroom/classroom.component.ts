import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DynamicTableComponent } from '../ui/dynamic-table/dynamic-table.component';
import { AddClassroomComponent } from '../add-classroom/add-classroom.component';
import { ClassroomService } from '../services/classroom.service';
import { SeriesService } from '../services/series.service';
import { ClassLevelService } from '../services/class-level.service';
import { SchoolService } from '../../school/services/school.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    DynamicTableComponent,
    AddClassroomComponent
  ],
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent implements OnInit {

  isModalVisible = false;
  isSubmitting = false;
  classroomForm!: FormGroup;

  columns = [
    { key: 'label', label: 'Nom de la classe' },
    { key: 'classLevelName', label: 'Niveau' },
    { key: 'seriesName', label: 'Série' },
    { key: 'schoolName', label: 'École' }
  ];

  classrooms: any[] = [];
  series: any[] = [];
  levels: any[] = [];
  schools: any[] = [];

  constructor(
    private fb: FormBuilder,
    private classroomService: ClassroomService,
    private seriesService: SeriesService,
    private classLevelService: ClassLevelService,
    private schoolService: SchoolService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferenceData();
  }

private initForm(): void {
  const schoolId = localStorage.getItem('schoolId') || '';

  this.classroomForm = this.fb.group({
    label: ['', Validators.required],
    classLevelId: ['', Validators.required],
    seriesId: ['', Validators.required],
    schoolId: [schoolId, Validators.required],
  });
}


  openModal(): void {
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  onFormChange(value: any): void {
    this.classroomForm.patchValue(value);
  }

  submitForm(): void {
    if (this.classroomForm.invalid) return;
    this.isSubmitting = true;

    this.classroomService.createClassroom(this.classroomForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.classroomForm.reset();
        this.loadClassrooms();
      },
      error: (err) => {
        console.error('Erreur lors de la création de la classe :', err);
        this.isSubmitting = false;
      }
    });
  }

  private async loadReferenceData(): Promise<void> {
    try {
      const [seriesRes, levelRes, schoolRes] = await Promise.all([
        firstValueFrom(this.seriesService.getSeries()),
        firstValueFrom(this.classLevelService.getClassLevels()),
        firstValueFrom(this.schoolService.getSchools())
      ]);

      this.series = seriesRes?.data ?? [];
      this.levels = levelRes?.data ?? [];
      this.schools = schoolRes?.data ?? [];

      this.loadClassrooms();
    } catch (error) {
      console.error('Erreur de chargement des données de référence', error);
    }
  }

  private loadClassrooms(): void {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) return;

    this.classroomService.getClassroomsBySchool(schoolId).subscribe({
      next: (res) => {
        this.classrooms = (res.data ?? []).map((cls: any) => ({
          ...cls,
          classLevelName: this.levels.find(l => l.id === cls.classLevelId)?.name || '—',
          seriesName: this.series.find(s => s.id === cls.seriesId)?.name || '—',
          schoolName: this.schools.find(e => e.id === cls.schoolId)?.name || '—',
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes', err);
      }
    });
  }

}
