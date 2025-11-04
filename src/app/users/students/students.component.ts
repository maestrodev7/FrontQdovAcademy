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

  columns = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' }
  ];
  constructor(private fb: FormBuilder, private userService: UsersService) {}

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
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  onFormChange(formValue: any): void {
    this.studentForm.patchValue(formValue);
  }

submitForm(): void {
  if (this.studentForm.invalid) {
    Object.values(this.studentForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
    });
    return;
  }

  this.isSubmitting = true;
    const payload = this.studentForm.value;

  this.userService.createStudentAndLinkParent(payload).subscribe({
    next: (res) => {
      this.isSubmitting = false;
      this.isModalVisible = false;

      const newStudent = {
        id: res.data?.id || payload.username,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: 'ELEVE',
      };

      this.students = [newStudent, ...this.students];
      this.studentForm.reset();
    },

    error: (err) => {
      this.isSubmitting = false;

      Object.keys(this.studentForm.controls).forEach((key) => {
        this.studentForm.get(key)?.setErrors(null);
      });
      this.studentForm.setErrors(null);

      if (err.status === 400 && err.error) {
        const errorData = err.error;

        if (errorData.error) {
          this.studentForm.setErrors({ apiError: errorData.error });
        }
        else {
          Object.keys(errorData).forEach((key) => {
            const control = this.studentForm.get(key);
            if (control) {
              control.setErrors({ apiError: errorData[key] });
            } else {
              this.studentForm.setErrors({ apiError: errorData[key] });
            }
          });
        }
      } else {
        this.studentForm.setErrors({
          apiError: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        });
      }
    },
  });

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
