import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../dashboad/ui/table/table.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddAdminComponent } from '../add-admin/add-admin.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.css'],
  standalone: true,
  imports: [
    TableComponent,
    NzButtonModule,
    AddAdminComponent,
    NzModalModule,
    NzGridModule,
    NzDividerModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class AdminsComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  adminForm!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UsersService) {}

  ngOnInit(): void {
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

    this.userService.createAdminForSchool(payload).subscribe({
      next: (res) => {
        console.log('✅ Admin créé et associé à une école :', res);
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.adminForm.reset();
      },
      error: (err) => {
        console.error('❌ Erreur :', err);
        this.isSubmitting = false;
      },
    });
  }
}
