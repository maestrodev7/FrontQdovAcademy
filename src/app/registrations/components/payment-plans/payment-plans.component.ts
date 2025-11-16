import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaymentPlanService } from '../../services/payment-plan.service';
import { PaymentPlan } from '../../interfaces/payment-plan.interface';

@Component({
  selector: 'app-payment-plans',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzTableModule,
    NzIconModule
  ],
  templateUrl: './payment-plans.component.html',
  styleUrls: ['./payment-plans.component.css']
})
export class PaymentPlansComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  paymentPlanForm!: FormGroup;
  paymentPlans: PaymentPlan[] = [];
  schoolId: string = '';

  constructor(
    private fb: FormBuilder,
    private paymentPlanService: PaymentPlanService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.schoolId = localStorage.getItem('schoolId') || '';
    this.initForm();
    this.loadPaymentPlans();
  }

  initForm(): void {
    this.paymentPlanForm = this.fb.group({
      label: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      orderIndex: [1, [Validators.required, Validators.min(1)]]
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.paymentPlanForm.reset({ orderIndex: 1 });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.paymentPlanForm.reset({ orderIndex: 1 });
  }

  submitForm(): void {
    if (this.paymentPlanForm.invalid) {
      Object.values(this.paymentPlanForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.paymentPlanForm.value;
    const payload = {
      ...formValue,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate).toISOString().split('T')[0] : ''
    };

    this.paymentPlanService.createPaymentPlan(this.schoolId, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.message.success('Plan de paiement créé avec succès');
        this.loadPaymentPlans();
        this.paymentPlanForm.reset({ orderIndex: 1 });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message.error(err?.error?.message || 'Erreur lors de la création');
      }
    });
  }

  loadPaymentPlans(): void {
    if (!this.schoolId) return;
    
    this.paymentPlanService.getPaymentPlansBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.paymentPlans = (res.data || []).sort((a, b) => a.orderIndex - b.orderIndex);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des plans de paiement', err);
      }
    });
  }

  deletePaymentPlan(id: string): void {
    this.paymentPlanService.deletePaymentPlan(this.schoolId, id).subscribe({
      next: () => {
        this.message.success('Plan de paiement supprimé');
        this.loadPaymentPlans();
      },
      error: (err) => {
        this.message.error('Erreur lors de la suppression');
      }
    });
  }
}

