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

  columns = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' }
  ];

  constructor(private fb: FormBuilder, private userService: UsersService) {}

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
  }

  onFormChange(formValue: any): void {
    this.adminForm.patchValue(formValue);
  }

  submitForm(): void {
    if (this.adminForm.invalid) return;

    this.isSubmitting = true;
    const payload = this.adminForm.value;

    this.userService.createTeacherForSchool(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;

        const newTeacher = {
          id: res.data?.userId || payload.username,
          fullName: `${payload.firstName} ${payload.lastName}`,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          role: 'ENSEIGNANT'
        };

        this.teachers = [newTeacher, ...this.teachers];

        this.adminForm.reset
      },
      error: (err) => {
        this.isSubmitting = false;
      },
    });
  }


}
