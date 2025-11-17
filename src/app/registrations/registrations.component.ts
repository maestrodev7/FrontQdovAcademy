import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FeeTypesComponent } from './components/fee-types/fee-types.component';
import { PaymentPlansComponent } from './components/payment-plans/payment-plans.component';
import { ClassFeesComponent } from './components/class-fees/class-fees.component';
import { RegisterStudentComponent } from './components/register-student/register-student.component';
import { RegistrationService } from './services/registration.service';
import { PaymentService } from './services/payment.service';
import { ClassFeeService } from './services/class-fee.service';
import { ClassroomService } from '../classroom/services/classroom.service';
import { Registration } from './interfaces/registration.interface';
import { ClassFee } from './interfaces/class-fee.interface';
import { Payment } from './interfaces/payment.interface';
import { ClassFeeWithPayment } from './interfaces/payment.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [
    CommonModule,
    NzTabsModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzSelectModule,
    NzIconModule,
    NzToolTipModule,
    ReactiveFormsModule,
    FormsModule,
    FeeTypesComponent,
    PaymentPlansComponent,
    ClassFeesComponent,
    RegisterStudentComponent
  ],
  templateUrl: './registrations.component.html',
  styleUrls: ['./registrations.component.css']
})
export class RegistrationsComponent implements OnInit {
  activeTab = 0;
  registrations: Registration[] = [];
  registrationsWithPayments: any[] = [];
  classFees: ClassFee[] = [];
  schoolId: string = '';
  selectedClassroom: string = '';
  classrooms: any[] = [];
  isPaymentModalVisible = false;
  isSubmittingPayment = false;
  paymentForm!: FormGroup;
  selectedRegistration: Registration | null = null;
  isFeesStatusModalVisible = false;
  selectedFeesStatus: any = null;

  constructor(
    private registrationService: RegistrationService,
    private paymentService: PaymentService,
    private classFeeService: ClassFeeService,
    private classroomService: ClassroomService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.schoolId = localStorage.getItem('schoolId') || '';
    this.initPaymentForm();
    this.loadClassrooms();
    this.loadRegistrations();
  }

  initPaymentForm(): void {
    this.paymentForm = this.fb.group({
      classFeeId: ['', [Validators.required]],
      amountPaid: [0, [Validators.required, Validators.min(0.01)]],
      paymentDate: ['', [Validators.required]]
    });
  }

  async loadClassrooms(): Promise<void> {
    if (!this.schoolId) return;
    try {
      const res = await firstValueFrom(this.classroomService.getClassroomsBySchool(this.schoolId));
      this.classrooms = res.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des classes', error);
    }
  }

  loadRegistrations(): void {
    if (!this.schoolId) return;

    this.registrationService.getRegistrationsBySchool(this.schoolId).subscribe({
      next: async (res) => {
        this.registrations = res.data || [];
        await this.loadPaymentsForRegistrations();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions', err);
      }
    });
  }

  async loadPaymentsForRegistrations(): Promise<void> {
    if (!this.schoolId) return;

    // Charger les frais de classe
    const classFeesRes = await firstValueFrom(this.classFeeService.getClassFeesBySchool(this.schoolId));
    this.classFees = classFeesRes.data || [];

    // Pour chaque inscription, charger les paiements et calculer l'état
    this.registrationsWithPayments = await Promise.all(
      this.registrations.map(async (registration) => {
        const classFeesForClass = this.classFees.filter(cf => cf.classRoomId === registration.classRoomId);

        const feesWithPayments: ClassFeeWithPayment[] = await Promise.all(
          classFeesForClass.map(async (classFee) => {
            try {
              const paymentsRes = await firstValueFrom(
                this.paymentService.getPaymentsByRegistration(registration.id)
              );
              const payments = (paymentsRes.data || []).filter((p: Payment) => p.classFeeId === classFee.id);
              const totalPaid = payments.reduce((sum: number, p: Payment) => sum + p.amountPaid, 0);
              const remaining = classFee.amount - totalPaid;

              let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
              if (totalPaid >= classFee.amount) {
                status = 'paid';
              } else if (totalPaid > 0) {
                status = 'partial';
              }

              return {
                classFee,
                totalPaid,
                remaining,
                payments,
                status
              };
            } catch (error) {
              return {
                classFee,
                totalPaid: 0,
                remaining: classFee.amount,
                payments: [],
                status: 'unpaid' as const
              };
            }
          })
        );

        return {
          registration,
          fees: feesWithPayments
        };
      })
    );
  }

  filterByClassroom(): void {
    if (!this.selectedClassroom) {
      this.loadRegistrations();
      return;
    }

    this.registrationService.getRegistrationsByClass(this.selectedClassroom).subscribe({
      next: async (res) => {
        this.registrations = res.data || [];
        await this.loadPaymentsForRegistrations();
      },
      error: (err) => {
        console.error('Erreur lors du filtrage', err);
      }
    });
  }

  openPaymentModal(registration: Registration): void {
    this.selectedRegistration = registration;
    const classFeesForClass = this.classFees.filter(cf => cf.classRoomId === registration.classRoomId);
    this.paymentForm.patchValue({
      classFeeId: classFeesForClass.length > 0 ? classFeesForClass[0].id : '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    this.isPaymentModalVisible = true;
  }

  handlePaymentCancel(): void {
    this.isPaymentModalVisible = false;
    this.selectedRegistration = null;
    this.paymentForm.reset();
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.selectedRegistration) {
      Object.values(this.paymentForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmittingPayment = true;
    const formValue = this.paymentForm.value;
    const payload = {
      classFeeId: formValue.classFeeId,
      amountPaid: formValue.amountPaid,
      paymentDate: formValue.paymentDate ? new Date(formValue.paymentDate).toISOString().split('T')[0] : ''
    };

    this.paymentService.createPayment(this.selectedRegistration!.id, payload).subscribe({
      next: () => {
        this.isSubmittingPayment = false;
        this.isPaymentModalVisible = false;
        this.message.success('Paiement enregistré avec succès');
        this.loadRegistrations();
        this.paymentForm.reset();
        this.selectedRegistration = null;
      },
      error: (err) => {
        this.isSubmittingPayment = false;
        this.message.error(err?.error?.message || 'Erreur lors de l\'enregistrement du paiement');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'green';
      case 'partial': return 'orange';
      case 'unpaid': return 'red';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiel';
      case 'unpaid': return 'Non payé';
      default: return '—';
    }
  }

  getClassFeesForSelectedRegistration(): ClassFee[] {
    if (!this.selectedRegistration) {
      return [];
    }
    return this.classFees.filter(cf => cf.classRoomId === this.selectedRegistration!.classRoomId);
  }

  openFeesStatusModal(item: any): void {
    this.selectedFeesStatus = item;
    this.isFeesStatusModalVisible = true;
  }

  handleFeesStatusCancel(): void {
    this.isFeesStatusModalVisible = false;
    this.selectedFeesStatus = null;
  }

  getOverallStatusColor(fees: ClassFeeWithPayment[]): string {
    if (!fees || fees.length === 0) return '#999';
    
    const allPaid = fees.every(f => f.status === 'paid');
    const allUnpaid = fees.every(f => f.status === 'unpaid');
    
    if (allPaid) return '#52c41a'; // Vert
    if (allUnpaid) return '#ff4d4f'; // Rouge
    return '#faad14'; // Orange (mixte)
  }

  getFeesStatusTooltip(fees: ClassFeeWithPayment[]): string {
    if (!fees || fees.length === 0) return 'Aucun frais';
    
    const paid = fees.filter(f => f.status === 'paid').length;
    const partial = fees.filter(f => f.status === 'partial').length;
    const unpaid = fees.filter(f => f.status === 'unpaid').length;
    
    return `Payé: ${paid} | Partiel: ${partial} | Non payé: ${unpaid}`;
  }

  getTotalPaid(fees: ClassFeeWithPayment[]): number {
    if (!fees || fees.length === 0) return 0;
    return fees.reduce((sum, fee) => sum + fee.totalPaid, 0);
  }

  getTotalRemaining(fees: ClassFeeWithPayment[]): number {
    if (!fees || fees.length === 0) return 0;
    return fees.reduce((sum, fee) => sum + fee.remaining, 0);
  }
}

