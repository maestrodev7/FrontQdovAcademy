import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AddParentComponent } from '../add-parent/add-parent.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../classroom/ui/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-parents',
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css'],
  standalone: true,
  imports: [
    NzButtonModule,
    AddParentComponent,
    NzModalModule,
    NzGridModule,
    NzDividerModule,
    ReactiveFormsModule,
    CommonModule,
    DynamicTableComponent,
  ],
})
export class ParentsComponent implements OnInit {
    isModalVisible = false;
    isSubmitting = false;
    parentForm!: FormGroup;
    parents: any[] = [];

  columns = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' }
  ];
  constructor(private fb: FormBuilder, private userService: UsersService) {}

  ngOnInit(): void {
    this.loadParents();
    this.parentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  openModal(): void {
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  onFormChange(formValue: any): void {
    this.parentForm.patchValue(formValue);
  }

submitForm(): void {
  if (this.parentForm.invalid) return;

  this.isSubmitting = true;
    const payload = {
    ...this.parentForm.value,
    roles: ['PARENT'],
  };

  this.userService.createUser(payload).subscribe({
    next: (res) => {
      this.isSubmitting = false;
      this.isModalVisible = false;

      const newParent = {
        id: res.data?.userId || payload.username,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: ['PARENT'],
      };

      this.parents = [newParent, ...this.parents];
      this.parentForm.reset();
    },

    error: (err) => {
      this.isSubmitting = false;

      Object.keys(this.parentForm.controls).forEach((key) => {
        this.parentForm.get(key)?.setErrors(null);
      });
      this.parentForm.setErrors(null);

      if (err.status === 400 && err.error) {
        const errorData = err.error;

        if (errorData.error) {
          this.parentForm.setErrors({ apiError: errorData.error });
        }
        else {
          Object.keys(errorData).forEach((key) => {
            const control = this.parentForm.get(key);
            if (control) {
              control.setErrors({ apiError: errorData[key] });
            } else {
              this.parentForm.setErrors({ apiError: errorData[key] });
            }
          });
        }
      } else {
        this.parentForm.setErrors({
          apiError: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        });
      }
    },
  });
}



private loadParents(): void {
  this.userService.getParents().subscribe({
    next: (res) => {
      this.parents = (res.data?.content ?? []).map((parent: any) => ({
        id: parent.id,
        fullName: `${parent.firstName} ${parent.lastName}`,
        email: parent.email,
        phoneNumber: parent.phoneNumber,
        role: parent.roles?.join(', ') || 'PARENT',
      }));
    },
    error: (err) => {
      console.error('Erreur de chargement des parents:', err);
    },
  });
}


}
