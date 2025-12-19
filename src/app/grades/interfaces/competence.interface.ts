export interface Competence {
  id?: string;
  subjectId: string;
  description: string;
  orderNumber: number;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateCompetenceRequest {
  subjectId: string;
  description: string;
  orderNumber: number;
}

export interface UpdateCompetenceRequest {
  description?: string;
  orderNumber?: number;
}

