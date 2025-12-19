export interface DisciplineRecord {
  id?: string;
  studentId: string;
  termId: string;
  classRoomId: string;
  unjustifiedAbsencesHours: number;
  justifiedAbsencesHours: number;
  lateCount: number;
  detentionHours: number;
  conductWarning: boolean;
  conductBlame: boolean;
  exclusionDays: number;
  permanentExclusion: boolean;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  term?: {
    id: string;
    name: string;
    number: number;
  };
  classRoom?: {
    id: string;
    label: string;
  };
}

export interface CreateDisciplineRecordRequest {
  studentId: string;
  termId: string;
  classRoomId: string;
  unjustifiedAbsencesHours: number;
  justifiedAbsencesHours: number;
  lateCount: number;
  detentionHours: number;
  conductWarning: boolean;
  conductBlame: boolean;
  exclusionDays: number;
  permanentExclusion: boolean;
}

export interface UpdateDisciplineRecordRequest {
  unjustifiedAbsencesHours?: number;
  justifiedAbsencesHours?: number;
  lateCount?: number;
  detentionHours?: number;
  conductWarning?: boolean;
  conductBlame?: boolean;
  exclusionDays?: number;
  permanentExclusion?: boolean;
}

