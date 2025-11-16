export interface Registration {
  id: string;
  studentId: string;
  studentFullName: string;
  classRoomId: string;
  classLabel: string;
  academicYearId: string;
  confirmed: boolean;
}

export interface CreateRegistrationRequest {
  studentId: string;
  classRoomId: string;
  academicYearId: string;
}
