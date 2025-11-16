export interface FeeType {
  id: string;
  name: string;
  mandatory: boolean;
  schoolId: string;
}

export interface CreateFeeTypeRequest {
  name: string;
  mandatory: boolean;
}



