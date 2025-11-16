import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClassFeeService } from '../../services/class-fee.service';
import { FeeTypeService } from '../../services/fee-type.service';
import { PaymentPlanService } from '../../services/payment-plan.service';
import { ClassroomService } from '../../../classroom/services/classroom.service';
import { ClassFee } from '../../interfaces/class-fee.interface';
import { FeeType } from '../../interfaces/fee-type.interface';
import { PaymentPlan } from '../../interfaces/payment-plan.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-class-fees',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTableModule,
    NzIconModule
  ],
  templateUrl: './class-fees.component.html',
  styleUrls: ['./class-fees.component.css']
})
export class ClassFeesComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  classFeeForm!: FormGroup;
  classFees: ClassFee[] = [];
  feeTypes: FeeType[] = [];
  paymentPlans: PaymentPlan[] = [];
  classrooms: any[] = [];
  schoolId: string = '';

  constructor(
    private fb: FormBuilder,
    private classFeeService: ClassFeeService,
    private feeTypeService: FeeTypeService,
    private paymentPlanService: PaymentPlanService,
    private classroomService: ClassroomService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.schoolId = localStorage.getItem('schoolId') || '';
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.classFeeForm = this.fb.group({
      classRoomId: ['', [Validators.required]],
      feeTypeId: ['', [Validators.required]],
      paymentPlanId: [null],
      amount: [0, [Validators.required, Validators.min(0)]],
      dueDate: ['', [Validators.required]]
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.classFeeForm.reset();
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.classFeeForm.reset();
  }

  submitForm(): void {
    if (this.classFeeForm.invalid) {
      Object.values(this.classFeeForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.classFeeForm.value;
    const payload: any = {
      classRoomId: formValue.classRoomId,
      feeTypeId: formValue.feeTypeId,
      amount: formValue.amount,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate).toISOString().split('T')[0] : ''
    };

    if (formValue.paymentPlanId) {
      payload.paymentPlanId = formValue.paymentPlanId;
    }

    this.classFeeService.createClassFee(this.schoolId, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.message.success('Frais de classe créé avec succès');
        this.loadClassFees();
        this.classFeeForm.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message.error(err?.error?.message || 'Erreur lors de la création');
      }
    });
  }

  async loadData(): Promise<void> {
    if (!this.schoolId) return;

    try {
      const [feeTypesRes, plansRes, classroomsRes] = await Promise.all([
        firstValueFrom(this.feeTypeService.getFeeTypesBySchool(this.schoolId)),
        firstValueFrom(this.paymentPlanService.getPaymentPlansBySchool(this.schoolId)),
        firstValueFrom(this.classroomService.getClassroomsBySchool(this.schoolId))
      ]);

      this.feeTypes = feeTypesRes.data || [];
      this.paymentPlans = (plansRes.data || []).sort((a, b) => a.orderIndex - b.orderIndex);
      this.classrooms = classroomsRes.data || [];

      this.loadClassFees();
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    }
  }

  loadClassFees(): void {
    if (!this.schoolId) return;
    
    this.classFeeService.getClassFeesBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.classFees = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des frais de classe', err);
      }
    });
  }

  deleteClassFee(id: string): void {
    this.classFeeService.deleteClassFee(this.schoolId, id).subscribe({
      next: () => {
        this.message.success('Frais de classe supprimé');
        this.loadClassFees();
      },
      error: (err) => {
        this.message.error('Erreur lors de la suppression');
      }
    });
  }

  getClassroomLabel(classRoomId: string): string {
    return this.classrooms.find(c => c.id === classRoomId)?.label || '—';
  }

}

