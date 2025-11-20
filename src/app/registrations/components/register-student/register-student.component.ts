import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RegistrationService } from '../../services/registration.service';
import { UsersService } from '../../../users/services/users.service';
import { ClassroomService } from '../../../classroom/services/classroom.service';
import { SchoolService } from '../../../school/services/school.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzIconModule
  ],
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.css']
})
export class RegisterStudentComponent implements OnInit {
  @Output() registrationCreated = new EventEmitter<void>();
  isModalVisible = false;
  isSubmitting = false;
  registrationForm!: FormGroup;
  students: any[] = [];
  classrooms: any[] = [];
  academicYears: any[] = [];
  currentAcademicYear: any = null;
  schoolId: string = '';

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private usersService: UsersService,
    private classroomService: ClassroomService,
    private schoolService: SchoolService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.schoolId = localStorage.getItem('schoolId') || '';
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.registrationForm = this.fb.group({
      studentId: ['', [Validators.required]],
      classRoomId: ['', [Validators.required]],
      academicYearId: ['', [Validators.required]]
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.registrationForm.reset();
    this.loadData().then(() => {
      if (this.currentAcademicYear) {
        this.registrationForm.patchValue({
          academicYearId: this.currentAcademicYear.id
        });
      }
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.registrationForm.reset();
  }

  submitForm(): void {
    if (this.registrationForm.invalid) {
      Object.values(this.registrationForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.registrationService.createRegistration(this.registrationForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.message.success('Élève inscrit avec succès');
        this.registrationForm.reset();
        this.registrationCreated.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message.error(err?.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }

  async loadData(): Promise<void> {
    if (!this.schoolId) return;

    try {
      const [studentsRes, classroomsRes, yearsRes] = await Promise.all([
        firstValueFrom(this.usersService.getStudents()),
        firstValueFrom(this.classroomService.getClassroomsBySchool(this.schoolId)),
        firstValueFrom(this.schoolService.getAcademicYears())
      ]);

      this.students = (studentsRes.data?.content ?? []).map((student: any) => ({
        id: student.id,
        label: `${student.firstName} ${student.lastName}`,
        fullName: `${student.firstName} ${student.lastName}`
      }));

      this.classrooms = classroomsRes.data || [];
      this.academicYears = (yearsRes.data || []).map((year: any) => ({
        id: year.id,
        label: `${year.startDate} - ${year.endDate}`,
        startDate: year.startDate,
        endDate: year.endDate,
        active: year.active
      }));

      this.currentAcademicYear = this.academicYears.find((year: any) => year.active === true);

      if (this.currentAcademicYear) {
        this.registrationForm.patchValue({
          academicYearId: this.currentAcademicYear.id
        });
      } else if (this.academicYears.length > 0) {
        this.currentAcademicYear = this.academicYears[0];
        this.registrationForm.patchValue({
          academicYearId: this.currentAcademicYear.id
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    }
  }

  filterStudentOption = (input: string, option: any): boolean => {
    return option.nzLabel.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }
}

