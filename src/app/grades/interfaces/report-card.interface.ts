import { DisciplineRecord } from './discipline-record.interface';

export interface CompetenceGradeDto {
  gradeId: string;
  competenceId: string;
  competenceDescription: string;
  competenceOrderNumber: number;
  noteN20: number;
  noteM20: number;
  coefficient: number;
  mXCoef: number;
  cote: number;
  minScore?: number;
  maxScore?: number;
  appreciation?: string;
  teacherName: string;
}

export interface SubjectGradesDto {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectCoefficient: number;
  teacherName: string;
  competences: CompetenceGradeDto[];
  totalScore: number;
  averageScore: number;
  totalCoefficient: number;
  weightedAverage: number;
  cote: number;
  minScore?: number;
  maxScore?: number;
}

export interface ReportCard {
  // Informations de l'élève
  studentId: string;
  studentName: string;
  studentUniqueIdentifier?: string;
  studentBirthDate?: string;
  studentBirthPlace?: string;
  studentGender?: 'M' | 'F';
  studentIsRepeating?: boolean;
  studentPhotoUrl?: string;

  // Informations parentales
  parentNames?: string;
  parentContacts?: string;

  // Informations de la classe et école
  classRoomId: string;
  classRoomLabel?: string;
  schoolId: string;
  schoolName?: string;
  schoolAddress?: string;
  schoolPhoneNumber?: string;
  schoolEmail?: string;

  // Année académique
  academicYearId: string;
  academicYearLabel?: string;

  // Période (trimestre ou séquence)
  termId?: string;
  termName?: string;
  sequenceId?: string;
  sequenceName?: string;

  // Notes organisées par matière
  subjectGrades: SubjectGradesDto[];

  // Statistiques générales
  totalGeneral: number;
  totalCoefficient: number;
  averageTrim: number;
  cote: number;
  totalGrades: number;

  // Record disciplinaire
  disciplineRecord?: DisciplineRecord;

  // Absences
  totalAbsenceHours?: number;

  // Date de génération
  generatedDate: string;
}
