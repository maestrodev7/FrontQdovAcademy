export interface Absence {
  id?: string;
  schoolId: string;
  classRoomId: string;
  subjectId: string;
  date: string;
  absentStudentIds?: string[];
  numberOfHours: number;
  scheduleId?: string;
  notes?: string;
  // Propriétés plates retournées par le backend
  studentId?: string;
  studentName?: string;
  classRoomLabel?: string;
  subjectName?: string;
  subjectCode?: string;
  schoolName?: string;
  academicYearId?: string;
  academicYearLabel?: string;
  // Propriétés imbriquées (pour compatibilité)
  school?: {
    id: string;
    name: string;
  };
  classRoom?: {
    id: string;
    label: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  absentStudents?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
  }>;
  schedule?: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export interface CreateAbsenceRequest {
  schoolId: string;
  classRoomId: string;
  subjectId: string;
  date: string;
  absentStudentIds: string[];
  numberOfHours: number;
  scheduleId?: string;
  notes?: string;
}

export interface UpdateAbsenceRequest {
  absentStudentIds?: string[];
  numberOfHours?: number;
  scheduleId?: string;
  notes?: string;
}

export interface AbsenceDateRangeParams {
  startDate: string;
  endDate: string;
}

export interface TotalHoursParams {
  startDate: string;
  endDate: string;
}

export interface TotalHoursResponse {
  totalHours: number;
  studentId: string;
  startDate: string;
  endDate: string;
}

