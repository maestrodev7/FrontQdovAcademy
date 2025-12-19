export interface Grade {
  id?: string;
  competenceId: string;
  studentId: string;
  termId: string;
  sequenceId?: string;
  noteN20: number;
  noteM20: number;
  coefficient: number;
  mXCoef: number;
  cote: number;
  minScore?: number;
  maxScore?: number;
  appreciation?: string;
  teacherId: string;
  competence?: {
    id: string;
    description: string;
    orderNumber: number;
    subject?: {
      id: string;
      name: string;
      code: string;
    };
  };
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
  sequence?: {
    id: string;
    name: string;
    number: number;
  };
}

export interface CreateGradeRequest {
  competenceId: string;
  studentId: string;
  termId: string;
  sequenceId?: string;
  noteN20: number;
  noteM20: number;
  coefficient: number;
  mXCoef: number;
  cote: number;
  minScore?: number;
  maxScore?: number;
  appreciation?: string;
  teacherId: string;
}

export interface UpdateGradeRequest {
  noteN20?: number;
  noteM20?: number;
  coefficient?: number;
  mXCoef?: number;
  cote?: number;
  minScore?: number;
  maxScore?: number;
  appreciation?: string;
}

