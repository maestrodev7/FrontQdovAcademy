import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FeeTypeService } from '../../services/fee-type.service';
import { FeeType } from '../../interfaces/fee-type.interface';

@Component({
  selector: 'app-fee-types',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzTableModule,
    NzTagModule,
    NzIconModule
  ],
  templateUrl: './fee-types.component.html',
  styleUrls: ['./fee-types.component.css']
})
export class FeeTypesComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  feeTypeForm!: FormGroup;
  feeTypes: FeeType[] = [];
  schoolId: string = '';

  constructor(
    private fb: FormBuilder,
    private feeTypeService: FeeTypeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.schoolId = localStorage.getItem('schoolId') || '';
    this.initForm();
    this.loadFeeTypes();
  }

  initForm(): void {
    this.feeTypeForm = this.fb.group({
      name: ['', [Validators.required]],
      mandatory: [false]
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.feeTypeForm.reset({ mandatory: false });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.feeTypeForm.reset({ mandatory: false });
  }

  submitForm(): void {
    if (this.feeTypeForm.invalid) {
      Object.values(this.feeTypeForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.feeTypeService.createFeeType(this.schoolId, this.feeTypeForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.message.success('Type de frais créé avec succès');
        this.loadFeeTypes();
        this.feeTypeForm.reset({ mandatory: false });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message.error(err?.error?.message || 'Erreur lors de la création');
      }
    });
  }

  loadFeeTypes(): void {
    if (!this.schoolId) return;
    
    this.feeTypeService.getFeeTypesBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.feeTypes = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types de frais', err);
      }
    });
  }

  deleteFeeType(id: string): void {
    this.feeTypeService.deleteFeeType(this.schoolId, id).subscribe({
      next: () => {
        this.message.success('Type de frais supprimé');
        this.loadFeeTypes();
      },
      error: (err) => {
        this.message.error('Erreur lors de la suppression');
      }
    });
  }
}

