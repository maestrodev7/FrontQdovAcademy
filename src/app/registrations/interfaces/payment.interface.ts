import { ClassFee } from './class-fee.interface';
import { Registration } from './registration.interface';

export interface Payment {
  id: string;
  registrationId: string;
  classFeeId: string;
  feeName: string;
  trancheLabel: string | null;
  trancheOrder: number | null;
  amountPaid: number;
  paymentDate: string;
}

export interface CreatePaymentRequest {
  classFeeId: string;
  amountPaid: number;
  paymentDate: string;
}

export interface RegistrationPaymentStatus {
  registration: Registration;
  fees: ClassFeeWithPayment[];
}

export interface ClassFeeWithPayment {
  classFee: ClassFee;
  totalPaid: number;
  remaining: number;
  payments: Payment[];
  status: 'paid' | 'partial' | 'unpaid';
}
