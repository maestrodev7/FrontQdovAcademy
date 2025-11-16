export interface ClassFee {
  id: string;
  classRoomId: string;
  classLabel: string;
  feeTypeId: string;
  feeName: string;
  mandatory: boolean;
  paymentPlanId: string | null;
  paymentPlanLabel: string | null;
  paymentPlanOrder: number | null;
  amount: number;
  dueDate: string;
}

export interface CreateClassFeeRequest {
  classRoomId: string;
  feeTypeId: string;
  paymentPlanId?: string;
  amount: number;
  dueDate: string;
}



