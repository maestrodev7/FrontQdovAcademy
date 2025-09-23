import { AcademicYear } from "./academic-year";

export interface School {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email?: string;
  academicYears?: AcademicYear[];
}
