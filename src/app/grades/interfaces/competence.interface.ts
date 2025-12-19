export interface Competence {
  id?: string;
  subjectId: string;
  description: string;
  orderNumber: number;
  subjectName: string;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateCompetenceRequest {
  subjectId: string;
  description: string;
}

export interface UpdateCompetenceRequest {
  description?: string;
}

