export interface StudentInfo {
  id?: string;
  studentId: string;
  uniqueIdentifier: string;
  birthDate: string;
  birthPlace: string;
  studentName:string;
  gender: 'M' | 'F';
  isRepeating: boolean;
  parentNames: string;
  parentContacts: string;
  photoUrl?: string;
}

export interface CreateStudentInfoRequest {
  studentId: string;
  parentId: string;
  classRoomId: string;
  birthDate: string;
  birthPlace: string;
  gender: 'M' | 'F';
  isRepeating: boolean;
  photoUrl?: string;
}

export interface UpdateStudentInfoRequest {
  uniqueIdentifier?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: 'M' | 'F';
  isRepeating?: boolean;
  parentNames?: string;
  parentContacts?: string;
  photoUrl?: string;
}

