export interface Sequence {
  id: string;
  name: string;
  number: number;
  termId: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

export interface CreateSequenceRequest {
  name: string;
  number: number;
  termId: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSequenceRequest {
  name: string;
  number: number;
  termId: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

