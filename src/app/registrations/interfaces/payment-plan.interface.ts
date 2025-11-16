export interface PaymentPlan {
  id: string;
  label: string;
  dueDate: string;
  orderIndex: number;
  schoolId: string;
}

export interface CreatePaymentPlanRequest {
  label: string;
  dueDate: string;
  orderIndex: number;
}



