export interface Term {
  id: string;
  name: string;
  number: number;
  academicYearId: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

export interface CreateTermRequest {
  name: string;
  number: number;
  academicYearId: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTermRequest {
  name: string;
  number: number;
  academicYearId: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

