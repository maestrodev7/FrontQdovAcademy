import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { StudentInfoService } from './services/student-info.service';
import { CompetenceService } from './services/competence.service';
import { GradeService } from './services/grade.service';
import { DisciplineRecordService } from './services/discipline-record.service';
import { SubjectService } from '../subjects/services/subject.service';
import { UsersService } from '../users/services/users.service';
import { SchoolService } from '../school/services/school.service';
import { ClassroomService } from '../classroom/services/classroom.service';
import { AuthService } from '../core/services/auth.service';
import { CreateStudentInfoRequest } from './interfaces/student-info.interface';
import { CreateCompetenceRequest } from './interfaces/competence.interface';
import { CreateGradeRequest } from './interfaces/grade.interface';
import { CreateDisciplineRecordRequest } from './interfaces/discipline-record.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzTabsModule,
    NzCardModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzTableModule,
    NzDividerModule,
    NzSpinModule,
    NzIconModule
  ],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit {
  // Onglets
  activeTab = 0;

  // Données générales
  schoolId: string | null = null;
  currentUser: any = null;
  isTeacher = false;
  loading = false;

  // Onglet 1: Informations des élèves
  studentInfoForm!: FormGroup;
  isStudentInfoModalVisible = false;
  isSubmittingStudentInfo = false;
  students: any[] = [];
  studentInfos: any[] = [];

  // Onglet 2: Compétences
  competenceForm!: FormGroup;
  isCompetenceModalVisible = false;
  isSubmittingCompetence = false;
  subjects: any[] = [];
  competences: any[] = [];
  selectedSubjectForCompetence: string | null = null;

  // Onglet 3: Notes
  gradeForm!: FormGroup;
  isGradeModalVisible = false;
  isSubmittingGrade = false;
  grades: any[] = [];
  terms: any[] = [];
  sequences: any[] = [];
  selectedTerm: string | null = null;
  selectedSequence: string | null = null;
  selectedCompetenceForGrade: string | null = null;
  selectedStudentForGrade: string | null = null;
  editingGrade: any = null;

  // Onglet 4: Records disciplinaires
  disciplineForm!: FormGroup;
  isDisciplineModalVisible = false;
  isSubmittingDiscipline = false;
  disciplineRecords: any[] = [];
  classrooms: any[] = [];
  selectedClassroomForDiscipline: string | null = null;
  selectedStudentForDiscipline: string | null = null;
  editingDiscipline: any = null;

  constructor(
    private fb: FormBuilder,
    private studentInfoService: StudentInfoService,
    private competenceService: CompetenceService,
    private gradeService: GradeService,
    private disciplineRecordService: DisciplineRecordService,
    private subjectService: SubjectService,
    private usersService: UsersService,
    private schoolService: SchoolService,
    private classroomService: ClassroomService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.schoolId = localStorage.getItem('schoolId');
    this.currentUser = this.authService.getUser();

    if (this.currentUser) {
      const role = Array.isArray(this.currentUser.roles)
        ? this.currentUser.roles[0]
        : this.currentUser.role || this.currentUser.roles;
      this.isTeacher = (typeof role === 'string' &&
        (role.includes('ENSEIGNANT') || role.includes('TEACHER')));
    }

    this.initForms();
    await this.loadInitialData();
  }

  private initForms(): void {
    // Formulaire StudentInfo
    this.studentInfoForm = this.fb.group({
      studentId: ['', Validators.required],
      uniqueIdentifier: ['', Validators.required],
      birthDate: ['', Validators.required],
      birthPlace: ['', Validators.required],
      gender: ['M', Validators.required],
      isRepeating: [false],
      parentNames: ['', Validators.required],
      parentContacts: ['', Validators.required],
      photoUrl: ['']
    });

    // Formulaire Compétence
    this.competenceForm = this.fb.group({
      subjectId: ['', Validators.required],
      description: ['', Validators.required]
    });

    // Formulaire Note
    this.gradeForm = this.fb.group({
      competenceId: ['', Validators.required],
      studentId: ['', Validators.required],
      termId: ['', Validators.required],
      sequenceId: [''],
      noteN20: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      noteM20: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      coefficient: [1, [Validators.required, Validators.min(0.1)]],
      mXCoef: [0, Validators.required],
      cote: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      minScore: [0],
      maxScore: [20],
      appreciation: [''],
      teacherId: ['']
    });

    // Formulaire Discipline
    this.disciplineForm = this.fb.group({
      studentId: ['', Validators.required],
      termId: ['', Validators.required],
      classRoomId: ['', Validators.required],
      unjustifiedAbsencesHours: [0, [Validators.required, Validators.min(0)]],
      justifiedAbsencesHours: [0, [Validators.required, Validators.min(0)]],
      lateCount: [0, [Validators.required, Validators.min(0)]],
      detentionHours: [0, [Validators.required, Validators.min(0)]],
      conductWarning: [false],
      conductBlame: [false],
      exclusionDays: [0, [Validators.required, Validators.min(0)]],
      permanentExclusion: [false]
    });
  }

  private async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadStudents(),
        this.loadSubjects(),
        this.loadTerms(),
        this.loadClassrooms()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.message.error('Erreur lors du chargement des données');
    } finally {
      this.loading = false;
    }
  }

  private async loadStudents(): Promise<void> {
    try {
      const res = await firstValueFrom(this.usersService.getStudents());
      this.students = (res.data?.content ?? []).map((student: any) => ({
        id: student.id,
        label: `${student.firstName} ${student.lastName}`,
        fullName: `${student.firstName} ${student.lastName}`
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
    }
  }

  private async loadSubjects(): Promise<void> {
    try {
      const res = await firstValueFrom(this.subjectService.getAllSubjects());
      this.subjects = res.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des matières:', error);
    }
  }

  private async loadTerms(): Promise<void> {
    if (!this.schoolId) return;
    try {
      const res = await firstValueFrom(this.schoolService.getTermsBySchool(this.schoolId));
      this.terms = res.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des trimestres:', error);
    }
  }

  private async loadClassrooms(): Promise<void> {
    if (!this.schoolId) return;
    try {
      const res = await firstValueFrom(this.classroomService.getClassroomsBySchool(this.schoolId));
      this.classrooms = res.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  }

  // ========== ONGLET 1: INFORMATIONS DES ÉLÈVES ==========
  openStudentInfoModal(): void {
    this.isStudentInfoModalVisible = true;
    this.studentInfoForm.reset({ gender: 'M', isRepeating: false });
  }

  handleStudentInfoCancel(): void {
    this.isStudentInfoModalVisible = false;
    this.studentInfoForm.reset({ gender: 'M', isRepeating: false });
  }

  submitStudentInfo(): void {
    if (this.studentInfoForm.invalid) {
      Object.keys(this.studentInfoForm.controls).forEach(key => {
        this.studentInfoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmittingStudentInfo = true;
    const payload: CreateStudentInfoRequest = this.studentInfoForm.value;

    this.studentInfoService.createStudentInfo(payload).subscribe({
      next: (res) => {
        this.message.success('Informations de l\'élève créées avec succès !');
        this.isSubmittingStudentInfo = false;
        this.isStudentInfoModalVisible = false;
        this.studentInfoForm.reset({ gender: 'M', isRepeating: false });
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error(err?.error?.message || 'Erreur lors de la création');
        this.isSubmittingStudentInfo = false;
      }
    });
  }

  // ========== ONGLET 2: COMPÉTENCES ==========
  openCompetenceModal(): void {
    this.isCompetenceModalVisible = true;
    this.competenceForm.reset({ orderNumber: 1 });
  }

  handleCompetenceCancel(): void {
    this.isCompetenceModalVisible = false;
    this.competenceForm.reset({ orderNumber: 1 });
  }

  submitCompetence(): void {
    if (this.competenceForm.invalid) {
      Object.keys(this.competenceForm.controls).forEach(key => {
        this.competenceForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmittingCompetence = true;
    const payload: CreateCompetenceRequest = this.competenceForm.value;

    this.competenceService.createCompetence(payload).subscribe({
      next: (res) => {
        this.message.success('Compétence créée avec succès !');
        this.isSubmittingCompetence = false;
        this.isCompetenceModalVisible = false;
        this.competenceForm.reset({ orderNumber: 1 });
        if (this.selectedSubjectForCompetence) {
          this.loadCompetencesBySubject(this.selectedSubjectForCompetence);
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error(err?.error?.message || 'Erreur lors de la création');
        this.isSubmittingCompetence = false;
      }
    });
  }

  onSubjectSelectedForCompetence(subjectId: string): void {
    this.selectedSubjectForCompetence = subjectId;
    this.loadCompetencesBySubject(subjectId);
  }

  loadCompetencesBySubject(subjectId: string): void {
    this.loading = true;
    this.competenceService.getCompetencesBySubject(subjectId).subscribe({
      next: (res) => {
        this.competences = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error('Erreur lors du chargement des compétences');
        this.loading = false;
      }
    });
  }

  // ========== ONGLET 3: NOTES ==========
  openGradeModal(): void {
    if (this.currentUser?.id) {
      this.gradeForm.patchValue({ teacherId: this.currentUser.id });
    }
    this.isGradeModalVisible = true;
    this.editingGrade = null;
    this.gradeForm.reset();
    if (this.selectedTerm) {
      this.gradeForm.patchValue({ termId: this.selectedTerm });
    }
    if (this.selectedSequence) {
      this.gradeForm.patchValue({ sequenceId: this.selectedSequence });
    }
    if (this.selectedCompetenceForGrade) {
      this.gradeForm.patchValue({ competenceId: this.selectedCompetenceForGrade });
    }
    if (this.selectedStudentForGrade) {
      this.gradeForm.patchValue({ studentId: this.selectedStudentForGrade });
    }
    // Charger toutes les compétences pour le select
    this.loadAllCompetences();
  }

  loadAllCompetences(): void {
    // Charger les compétences de toutes les matières
    if (this.subjects.length > 0) {
      this.competences = [];
      this.subjects.forEach(subject => {
        this.competenceService.getCompetencesBySubject(subject.id).subscribe({
          next: (res) => {
            if (res.data) {
              this.competences = [...this.competences, ...res.data];
            }
          },
          error: (err) => {
            console.error('Erreur lors du chargement des compétences:', err);
          }
        });
      });
    }
  }

  handleGradeCancel(): void {
    this.isGradeModalVisible = false;
    this.editingGrade = null;
    this.gradeForm.reset();
  }

  calculateGradeValues(): void {
    const noteN20 = this.gradeForm.get('noteN20')?.value || 0;
    const noteM20 = this.gradeForm.get('noteM20')?.value || 0;
    const coefficient = this.gradeForm.get('coefficient')?.value || 1;

    const mXCoef = noteM20 * coefficient;
    const cote = noteM20;

    this.gradeForm.patchValue({
      mXCoef: parseFloat(mXCoef.toFixed(2)),
      cote: parseFloat(cote.toFixed(2))
    }, { emitEvent: false });
  }

  submitGrade(): void {
    if (this.gradeForm.invalid) {
      Object.keys(this.gradeForm.controls).forEach(key => {
        this.gradeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmittingGrade = true;
    const formValue = this.gradeForm.value;
    const payload: CreateGradeRequest = {
      ...formValue,
      sequenceId: formValue.sequenceId || undefined
    };

    if (this.editingGrade) {
      this.gradeService.updateGrade(this.editingGrade.id, payload).subscribe({
        next: (res) => {
          this.message.success('Note mise à jour avec succès !');
          this.isSubmittingGrade = false;
          this.isGradeModalVisible = false;
          this.handleGradeCancel();
          this.loadGrades();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error(err?.error?.message || 'Erreur lors de la mise à jour');
          this.isSubmittingGrade = false;
        }
      });
    } else {
      this.gradeService.createGrade(payload).subscribe({
        next: (res) => {
          this.message.success('Note créée avec succès !');
          this.isSubmittingGrade = false;
          this.isGradeModalVisible = false;
          this.handleGradeCancel();
          this.loadGrades();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error(err?.error?.message || 'Erreur lors de la création');
          this.isSubmittingGrade = false;
        }
      });
    }
  }

  loadGrades(): void {
    if (!this.selectedStudentForGrade || !this.selectedTerm) return;

    this.loading = true;
    if (this.selectedSequence) {
      this.gradeService.getGradesByStudentAndSequence(this.selectedStudentForGrade, this.selectedSequence).subscribe({
        next: (res) => {
          this.grades = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error('Erreur lors du chargement des notes');
          this.loading = false;
        }
      });
    } else {
      this.gradeService.getGradesByStudentAndTerm(this.selectedStudentForGrade, this.selectedTerm).subscribe({
        next: (res) => {
          this.grades = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error('Erreur lors du chargement des notes');
          this.loading = false;
        }
      });
    }
  }

  onTermSelected(): void {
    if (this.selectedTerm) {
      this.loadSequences();
      this.loadGrades();
    }
  }

  onSequenceSelected(): void {
    if (this.selectedSequence) {
      this.loadGrades();
    }
  }

  loadSequences(): void {
    if (!this.selectedTerm) return;
    this.schoolService.getSequencesByTerm(this.selectedTerm).subscribe({
      next: (res) => {
        this.sequences = res.data || [];
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  editGrade(grade: any): void {
    this.editingGrade = grade;
    this.gradeForm.patchValue(grade);
    this.isGradeModalVisible = true;
  }

  deleteGrade(grade: any): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    this.gradeService.deleteGrade(grade.id).subscribe({
      next: () => {
        this.message.success('Note supprimée avec succès !');
        this.loadGrades();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error('Erreur lors de la suppression');
      }
    });
  }

  // ========== ONGLET 4: RECORDS DISCIPLINAIRES ==========
  openDisciplineModal(): void {
    this.isDisciplineModalVisible = true;
    this.editingDiscipline = null;
    this.disciplineForm.reset({
      unjustifiedAbsencesHours: 0,
      justifiedAbsencesHours: 0,
      lateCount: 0,
      detentionHours: 0,
      conductWarning: false,
      conductBlame: false,
      exclusionDays: 0,
      permanentExclusion: false
    });
    if (this.selectedTerm) {
      this.disciplineForm.patchValue({ termId: this.selectedTerm });
    }
    if (this.selectedClassroomForDiscipline) {
      this.disciplineForm.patchValue({ classRoomId: this.selectedClassroomForDiscipline });
    }
    if (this.selectedStudentForDiscipline) {
      this.disciplineForm.patchValue({ studentId: this.selectedStudentForDiscipline });
    }
  }

  handleDisciplineCancel(): void {
    this.isDisciplineModalVisible = false;
    this.editingDiscipline = null;
    this.disciplineForm.reset();
  }

  submitDiscipline(): void {
    if (this.disciplineForm.invalid) {
      Object.keys(this.disciplineForm.controls).forEach(key => {
        this.disciplineForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmittingDiscipline = true;
    const payload: CreateDisciplineRecordRequest = this.disciplineForm.value;

    if (this.editingDiscipline) {
      this.disciplineRecordService.updateDisciplineRecord(this.editingDiscipline.id, payload).subscribe({
        next: (res) => {
          this.message.success('Record disciplinaire mis à jour avec succès !');
          this.isSubmittingDiscipline = false;
          this.isDisciplineModalVisible = false;
          this.handleDisciplineCancel();
          this.loadDisciplineRecords();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error(err?.error?.message || 'Erreur lors de la mise à jour');
          this.isSubmittingDiscipline = false;
        }
      });
    } else {
      this.disciplineRecordService.createDisciplineRecord(payload).subscribe({
        next: (res) => {
          this.message.success('Record disciplinaire créé avec succès !');
          this.isSubmittingDiscipline = false;
          this.isDisciplineModalVisible = false;
          this.handleDisciplineCancel();
          this.loadDisciplineRecords();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error(err?.error?.message || 'Erreur lors de la création');
          this.isSubmittingDiscipline = false;
        }
      });
    }
  }

  loadDisciplineRecords(): void {
    if (!this.selectedStudentForDiscipline || !this.selectedTerm) return;

    this.loading = true;
    this.disciplineRecordService.getDisciplineRecordByStudentAndTerm(
      this.selectedStudentForDiscipline,
      this.selectedTerm
    ).subscribe({
      next: (res) => {
        if (res.data) {
          this.disciplineRecords = [res.data];
        } else {
          this.disciplineRecords = [];
        }
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.disciplineRecords = [];
        } else {
          console.error('Erreur:', err);
          this.message.error('Erreur lors du chargement du record disciplinaire');
        }
        this.loading = false;
      }
    });
  }

  editDiscipline(record: any): void {
    this.editingDiscipline = record;
    this.disciplineForm.patchValue(record);
    this.isDisciplineModalVisible = true;
  }

  deleteDiscipline(record: any): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce record disciplinaire ?')) return;

    this.disciplineRecordService.deleteDisciplineRecord(record.id).subscribe({
      next: () => {
        this.message.success('Record disciplinaire supprimé avec succès !');
        this.loadDisciplineRecords();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error('Erreur lors de la suppression');
      }
    });
  }
}
