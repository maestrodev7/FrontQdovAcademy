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
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { StudentInfoService } from './services/student-info.service';
import { CompetenceService } from './services/competence.service';
import { GradeService } from './services/grade.service';
import { DisciplineRecordService } from './services/discipline-record.service';
import { AbsenceService } from './services/absence.service';
import { ScheduleService } from '../subjects/services/schedule.service';
import { SubjectService } from '../subjects/services/subject.service';
import { UsersService } from '../users/services/users.service';
import { SchoolService } from '../school/services/school.service';
import { ClassroomService } from '../classroom/services/classroom.service';
import { RegistrationService } from '../registrations/services/registration.service';
import { AuthService } from '../core/services/auth.service';
import { CreateStudentInfoRequest } from './interfaces/student-info.interface';
import { CreateCompetenceRequest } from './interfaces/competence.interface';
import { CreateGradeRequest } from './interfaces/grade.interface';
import { CreateDisciplineRecordRequest } from './interfaces/discipline-record.interface';
import { CreateAbsenceRequest } from './interfaces/absence.interface';
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
    NzIconModule,
    NzCheckboxModule,
    NzTagModule
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
  enrolledStudents: any[] = []; // Élèves inscrits dans la classe sélectionnée
  studentInfos: any[] = [];
  selectedClassroomForStudentInfo: string | null = null;
  currentAcademicYear: any = null;
  parents: any[] = [];
  private classRoomSubscription: any;
  private studentSubscription: any;

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
  selectedClassroomForGrade: string | null = null;
  studentsForGrade: any[] = []; // Élèves filtrés par classe pour l'onglet Notes
  studentsForGradeModal: any[] = []; // Élèves filtrés par classe pour le modal d'ajout de note
  selectedClassroomForGradeModal: string | null = null;
  editingGrade: any = null;

  // Onglet 4: Records disciplinaires
  disciplineForm!: FormGroup;
  isDisciplineModalVisible = false;
  isSubmittingDiscipline = false;
  disciplineRecords: any[] = [];
  classrooms: any[] = [];
  selectedClassroomForDiscipline: string | null = null;
  selectedStudentForDiscipline: string | null = null;
  studentsForDiscipline: any[] = []; // Élèves filtrés par classe pour l'onglet Records disciplinaires
  studentsForDisciplineModal: any[] = []; // Élèves filtrés par classe pour le modal d'ajout de record disciplinaire
  selectedClassroomForDisciplineModal: string | null = null;
  editingDiscipline: any = null;

  // Onglet 5: Absences
  absenceForm!: FormGroup;
  isAbsenceModalVisible = false;
  isSubmittingAbsence = false;
  absences: any[] = [];
  selectedClassroomForAbsence: string | null = null;
  selectedSubjectForAbsence: string | null = null;
  selectedDateForAbsence: string | null = null;
  studentsForAbsence: any[] = []; // Élèves filtrés par classe pour l'onglet Absences
  studentsForAbsenceModal: any[] = []; // Élèves filtrés par classe pour le modal d'ajout d'absence
  selectedClassroomForAbsenceModal: string | null = null;
  selectedStudentsForAbsence: string[] = []; // IDs des élèves absents sélectionnés
  schedules: any[] = [];
  editingAbsence: any = null;

  selectedAbsentStudents: string[] = []; // IDs des élèves absents sélectionnés


  selectedStudentForAbsence: string | null = null;
  startDateForAbsence: string | null = null;
  endDateForAbsence: string | null = null;
  totalAbsenceHours: number = 0;

  selectedStudentForAbsenceReport: string | null = null;

  constructor(
    private fb: FormBuilder,
    private studentInfoService: StudentInfoService,
    private competenceService: CompetenceService,
    private gradeService: GradeService,
    private disciplineRecordService: DisciplineRecordService,
    private absenceService: AbsenceService,
    private subjectService: SubjectService,
    private usersService: UsersService,
    private schoolService: SchoolService,
    private classroomService: ClassroomService,
    private registrationService: RegistrationService,
    private scheduleService: ScheduleService,
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
      parentId: ['', Validators.required],
      classRoomId: ['', Validators.required],
      birthDate: ['', Validators.required],
      birthPlace: ['', Validators.required],
      gender: ['M', Validators.required],
      isRepeating: [false],
      photoUrl: ['']
    });

    // Formulaire Compétence
    this.competenceForm = this.fb.group({
      subjectId: ['', Validators.required],
      description: ['', Validators.required]
    });

    // Formulaire Note
    this.gradeForm = this.fb.group({
      classRoomId: ['', Validators.required],
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

    // Formulaire Absence
    this.absenceForm = this.fb.group({
      schoolId: ['', Validators.required],
      classRoomId: ['', Validators.required],
      subjectId: ['', Validators.required],
      date: ['', Validators.required],
      absentStudentIds: [[], Validators.required],
      numberOfHours: [1, [Validators.required, Validators.min(0.5)]],
      scheduleId: [''],
      notes: ['']
    });
  }

  private async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadAcademicYear(),
        this.loadSubjects(),
        this.loadTerms(),
        this.loadClassrooms(),
        this.loadParents()
      ]);
      // Ne pas charger tous les élèves au démarrage, seulement quand une classe est sélectionnée
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.message.error('Erreur lors du chargement des données');
    } finally {
      this.loading = false;
    }
  }

  private async loadAcademicYear(): Promise<void> {
    try {
      const res = await firstValueFrom(this.schoolService.getAcademicYears());
      const academicYears = res.data || [];
      this.currentAcademicYear = academicYears.find((year: any) => year.active === true) || academicYears[0];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'année académique:', error);
    }
  }

  private async loadParents(): Promise<void> {
    try {
      const res = await firstValueFrom(this.usersService.getParents());
      this.parents = (res.data?.content ?? []).map((parent: any) => ({
        id: parent.id,
        label: `${parent.firstName} ${parent.lastName}`,
        fullName: `${parent.firstName} ${parent.lastName}`
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des parents:', error);
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
    this.enrolledStudents = [];

    // Écouter les changements de classe dans le formulaire
    this.studentInfoForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.loadEnrolledStudents(classRoomId);
      } else {
        this.enrolledStudents = [];
        this.studentInfoForm.patchValue({ studentId: '' }, { emitEvent: false });
      }
    });

    // Écouter les changements d'élève pour auto-remplir le parent
    this.studentInfoForm.get('studentId')?.valueChanges.subscribe(studentId => {
      if (studentId) {
        const selectedStudent = this.enrolledStudents.find(s => s.id === studentId);
        if (selectedStudent && selectedStudent.parentId) {
          this.studentInfoForm.patchValue({ parentId: selectedStudent.parentId }, { emitEvent: false });
        }
      }
    });
  }

  handleStudentInfoCancel(): void {
    this.isStudentInfoModalVisible = false;
    this.studentInfoForm.reset({ gender: 'M', isRepeating: false });
    this.enrolledStudents = [];
    // Désabonner les observables pour éviter les fuites mémoire
    if (this.classRoomSubscription) {
      this.classRoomSubscription.unsubscribe();
    }
    if (this.studentSubscription) {
      this.studentSubscription.unsubscribe();
    }
  }

  loadEnrolledStudents(classRoomId: string): void {
    if (!classRoomId) {
      this.enrolledStudents = [];
      return;
    }

    this.loading = true;
    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        console.log('Inscriptions reçues:', registrations);

        if (registrations.length === 0) {
          this.enrolledStudents = [];
          this.loading = false;
          return;
        }

        // Récupérer les détails complets des élèves depuis l'API users
        const studentIds = registrations.map((reg: any) => reg.studentId || reg.student?.id).filter((id: any) => id);

        if (studentIds.length === 0) {
          console.warn('Aucun studentId trouvé dans les inscriptions');
          this.enrolledStudents = [];
          this.loading = false;
          return;
        }

        try {
          // Récupérer tous les élèves
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];
          console.log('Tous les élèves récupérés:', allStudents);

          // Mapper les inscriptions aux élèves
          this.enrolledStudents = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`,
                  parentId: student.parentId || null
                };
              }
              // Si l'élève n'est pas trouvé, utiliser les données de l'inscription
              const registration = registrations.find((reg: any) => (reg.studentId || reg.student?.id) === studentId);
              if (registration) {
                return {
                  id: studentId,
                  label: registration.studentFullName || `Élève ${studentId}`,
                  fullName: registration.studentFullName || `Élève ${studentId}`,
                  parentId: null
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);

          console.log('Élèves inscrits mappés:', this.enrolledStudents);
        } catch (error) {
          console.error('Erreur lors du chargement des détails des élèves:', error);
          // Fallback : utiliser les données de base de l'inscription
          this.enrolledStudents = registrations
            .filter((reg: any) => reg.studentId || reg.student?.id)
            .map((reg: any) => ({
              id: reg.studentId || reg.student?.id,
              label: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`),
              fullName: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`),
              parentId: reg.student?.parentId || reg.parentId || null
            }));
          console.log('Fallback - Élèves inscrits:', this.enrolledStudents);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves inscrits:', err);
        console.error('Détails de l\'erreur:', err.error);
        this.message.error('Erreur lors du chargement des élèves inscrits');
        this.enrolledStudents = [];
        this.loading = false;
      }
    });
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
        this.enrolledStudents = [];
        // Recharger les informations d'élèves si une classe est sélectionnée
        if (this.selectedClassroomForStudentInfo && this.currentAcademicYear) {
          this.loadStudentInfos();
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error(err?.error?.message || 'Erreur lors de la création');
        this.isSubmittingStudentInfo = false;
      }
    });
  }

  onClassroomSelectedForListing(classRoomId: string): void {
    this.selectedClassroomForStudentInfo = classRoomId;
    this.loadStudentInfos();
  }

  loadStudentInfos(): void {
    if (!this.selectedClassroomForStudentInfo || !this.currentAcademicYear) {
      this.studentInfos = [];
      return;
    }

    this.loading = true;
    this.studentInfoService.getStudentInfosByClassAndAcademicYear(
      this.selectedClassroomForStudentInfo,
      this.currentAcademicYear.id
    ).subscribe({
      next: (res) => {
        this.studentInfos = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des informations:', err);
        this.message.error('Erreur lors du chargement des informations');
        this.studentInfos = [];
        this.loading = false;
      }
    });
  }

  // Fonction de filtrage pour la recherche dans la liste des élèves
  filterStudentOption(input: string, option: any): boolean {
    if (!input) return true;
    const searchText = input.toLowerCase();
    const label = option?.nzLabel?.toLowerCase() || '';
    return label.includes(searchText);
  }

  // Fonction de filtrage pour la recherche dans la liste des parents
  filterParentOption(input: string, option: any): boolean {
    if (!input) return true;
    const searchText = input.toLowerCase();
    const label = option?.nzLabel?.toLowerCase() || '';
    return label.includes(searchText);
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
  onClassroomSelectedForGrade(classRoomId: string): void {
    console.log('Classe sélectionnée pour les notes:', classRoomId);
    this.selectedClassroomForGrade = classRoomId;
    this.selectedStudentForGrade = null; // Réinitialiser la sélection d'élève
    this.grades = []; // Vider les notes
    this.selectedSequence = null; // Réinitialiser la séquence

    if (classRoomId) {
      this.loadStudentsForGrade(classRoomId);
    } else {
      this.studentsForGrade = [];
      console.log('Aucune classe sélectionnée, liste des élèves vidée');
    }
  }

  loadStudentsForGrade(classRoomId: string): void {
    if (!classRoomId) {
      this.studentsForGrade = [];
      this.selectedStudentForGrade = null;
      return;
    }

    console.log('Chargement des élèves pour la classe:', classRoomId);
    this.loading = true;
    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        console.log('Inscriptions reçues pour les notes:', registrations);
        console.log('Nombre d\'inscriptions:', registrations.length);

        if (registrations.length === 0) {
          console.warn('Aucune inscription trouvée pour cette classe');
          this.studentsForGrade = [];
          this.loading = false;
          this.message.warning('Aucun élève inscrit dans cette classe');
          return;
        }

        // Récupérer les détails complets des élèves
        const studentIds = registrations
          .map((reg: any) => reg.studentId || reg.student?.id)
          .filter((id: any) => id);

        console.log('IDs des élèves extraits:', studentIds);

        if (studentIds.length === 0) {
          console.warn('Aucun studentId trouvé dans les inscriptions');
          this.studentsForGrade = [];
          this.loading = false;
          return;
        }

        try {
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];
          console.log('Tous les élèves récupérés:', allStudents.length);

          this.studentsForGrade = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`
                };
              }
              // Si l'élève n'est pas trouvé, utiliser les données de l'inscription
              const registration = registrations.find((reg: any) => (reg.studentId || reg.student?.id) === studentId);
              if (registration) {
                return {
                  id: studentId,
                  label: registration.studentFullName || `Élève ${studentId}`,
                  fullName: registration.studentFullName || `Élève ${studentId}`
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);

          console.log('Élèves chargés pour les notes:', this.studentsForGrade);
          console.log('Nombre d\'élèves chargés:', this.studentsForGrade.length);

          if (this.studentsForGrade.length === 0) {
            this.message.warning('Aucun élève trouvé pour cette classe');
          }
        } catch (error) {
          console.error('Erreur lors du chargement des détails des élèves:', error);
          // Fallback : utiliser les données de base de l'inscription
          this.studentsForGrade = registrations
            .filter((reg: any) => reg.studentId || reg.student?.id)
            .map((reg: any) => ({
              id: reg.studentId || reg.student?.id,
              label: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`),
              fullName: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`)
            }));
          console.log('Fallback - Élèves chargés:', this.studentsForGrade);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves inscrits:', err);
        console.error('Détails de l\'erreur:', err.error);
        this.message.error('Erreur lors du chargement des élèves inscrits dans cette classe');
        this.studentsForGrade = [];
        this.loading = false;
      }
    });
  }

  openGradeModal(): void {
    if (this.currentUser?.id) {
      this.gradeForm.patchValue({ teacherId: this.currentUser.id });
    }
    this.isGradeModalVisible = true;
    this.editingGrade = null;
    this.gradeForm.reset();
    this.studentsForGradeModal = [];
    this.selectedClassroomForGradeModal = null;

    // Pré-remplir avec les valeurs de l'onglet si disponibles
    if (this.selectedClassroomForGrade) {
      this.selectedClassroomForGradeModal = this.selectedClassroomForGrade;
      this.gradeForm.patchValue({ classRoomId: this.selectedClassroomForGrade });
      this.loadStudentsForGradeModal(this.selectedClassroomForGrade);
    }

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

    // Écouter les changements de classe dans le formulaire
    this.gradeForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.selectedClassroomForGradeModal = classRoomId;
        this.loadStudentsForGradeModal(classRoomId);
      } else {
        this.studentsForGradeModal = [];
        this.gradeForm.patchValue({ studentId: '' }, { emitEvent: false });
      }
    });

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
    this.studentsForGradeModal = [];
    this.selectedClassroomForGradeModal = null;
  }

  loadStudentsForGradeModal(classRoomId: string): void {
    if (!classRoomId) {
      this.studentsForGradeModal = [];
      return;
    }

    console.log('Chargement des élèves pour le modal de note, classe:', classRoomId);
    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        console.log('Inscriptions reçues pour le modal:', registrations);

        if (registrations.length === 0) {
          this.studentsForGradeModal = [];
          return;
        }

        const studentIds = registrations
          .map((reg: any) => reg.studentId || reg.student?.id)
          .filter((id: any) => id);

        if (studentIds.length === 0) {
          this.studentsForGradeModal = [];
          return;
        }

        try {
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];

          this.studentsForGradeModal = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`
                };
              }
              const registration = registrations.find((reg: any) => (reg.studentId || reg.student?.id) === studentId);
              if (registration) {
                return {
                  id: studentId,
                  label: registration.studentFullName || `Élève ${studentId}`,
                  fullName: registration.studentFullName || `Élève ${studentId}`
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);

          console.log('Élèves chargés pour le modal:', this.studentsForGradeModal);
        } catch (error) {
          console.error('Erreur lors du chargement des élèves pour le modal:', error);
          this.studentsForGradeModal = registrations
            .filter((reg: any) => reg.studentId || reg.student?.id)
            .map((reg: any) => ({
              id: reg.studentId || reg.student?.id,
              label: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`),
              fullName: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`)
            }));
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves pour le modal:', err);
        this.studentsForGradeModal = [];
      }
    });
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
    // Exclure classRoomId du payload car il n'est pas requis par le backend
    const { classRoomId, ...gradeData } = formValue;
    const payload: CreateGradeRequest = {
      ...gradeData,
      sequenceId: gradeData.sequenceId || undefined
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

    // Si la note a une classe, charger les élèves de cette classe
    if (grade.classRoomId) {
      this.selectedClassroomForGradeModal = grade.classRoomId;
      this.loadStudentsForGradeModal(grade.classRoomId);
    } else if (this.selectedClassroomForGrade) {
      // Sinon, utiliser la classe sélectionnée dans l'onglet
      this.selectedClassroomForGradeModal = this.selectedClassroomForGrade;
      this.gradeForm.patchValue({ classRoomId: this.selectedClassroomForGrade });
      this.loadStudentsForGradeModal(this.selectedClassroomForGrade);
    }

    // Écouter les changements de classe dans le formulaire
    this.gradeForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.selectedClassroomForGradeModal = classRoomId;
        this.loadStudentsForGradeModal(classRoomId);
      } else {
        this.studentsForGradeModal = [];
        this.gradeForm.patchValue({ studentId: '' }, { emitEvent: false });
      }
    });

    // Charger toutes les compétences pour le select
    this.loadAllCompetences();
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
  onClassroomSelectedForDiscipline(classRoomId: string): void {
    console.log('Classe sélectionnée pour les records disciplinaires:', classRoomId);
    this.selectedClassroomForDiscipline = classRoomId;
    this.selectedStudentForDiscipline = null; // Réinitialiser la sélection d'élève
    this.disciplineRecords = []; // Vider les records

    if (classRoomId) {
      this.loadStudentsForDiscipline(classRoomId);
    } else {
      this.studentsForDiscipline = [];
      console.log('Aucune classe sélectionnée, liste des élèves vidée');
    }
  }

  loadStudentsForDiscipline(classRoomId: string): void {
    if (!classRoomId) {
      this.studentsForDiscipline = [];
      return;
    }

    console.log('Chargement des élèves pour les records disciplinaires, classe:', classRoomId);
    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        console.log('Inscriptions reçues pour les records disciplinaires:', registrations);

        if (registrations.length === 0) {
          this.studentsForDiscipline = [];
          return;
        }

        const studentIds = registrations
          .map((reg: any) => reg.studentId || reg.student?.id)
          .filter((id: any) => id);

        if (studentIds.length === 0) {
          this.studentsForDiscipline = [];
          return;
        }

        try {
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];

          this.studentsForDiscipline = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`
                };
              }
              const registration = registrations.find((reg: any) => (reg.studentId || reg.student?.id) === studentId);
              if (registration) {
                return {
                  id: studentId,
                  label: registration.studentFullName || `Élève ${studentId}`,
                  fullName: registration.studentFullName || `Élève ${studentId}`
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);

          console.log('Élèves chargés pour les records disciplinaires:', this.studentsForDiscipline);
        } catch (error) {
          console.error('Erreur lors du chargement des élèves pour les records disciplinaires:', error);
          this.studentsForDiscipline = registrations
            .filter((reg: any) => reg.studentId || reg.student?.id)
            .map((reg: any) => ({
              id: reg.studentId || reg.student?.id,
              label: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`),
              fullName: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`)
            }));
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves inscrits:', err);
        this.studentsForDiscipline = [];
      }
    });
  }

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
    this.studentsForDisciplineModal = [];
    this.selectedClassroomForDisciplineModal = null;

    // Pré-remplir avec les valeurs de l'onglet si disponibles
    if (this.selectedClassroomForDiscipline) {
      this.selectedClassroomForDisciplineModal = this.selectedClassroomForDiscipline;
      this.disciplineForm.patchValue({ classRoomId: this.selectedClassroomForDiscipline });
      this.loadStudentsForDisciplineModal(this.selectedClassroomForDiscipline);
    }

    if (this.selectedTerm) {
      this.disciplineForm.patchValue({ termId: this.selectedTerm });
    }
    if (this.selectedStudentForDiscipline) {
      this.disciplineForm.patchValue({ studentId: this.selectedStudentForDiscipline });
    }

    // Écouter les changements de classe dans le formulaire
    this.disciplineForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.selectedClassroomForDisciplineModal = classRoomId;
        this.loadStudentsForDisciplineModal(classRoomId);
      } else {
        this.studentsForDisciplineModal = [];
        this.disciplineForm.patchValue({ studentId: '' }, { emitEvent: false });
      }
    });
  }

  loadStudentsForDisciplineModal(classRoomId: string): void {
    if (!classRoomId) {
      this.studentsForDisciplineModal = [];
      return;
    }

    console.log('Chargement des élèves pour le modal de record disciplinaire, classe:', classRoomId);
    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        console.log('Inscriptions reçues pour le modal de discipline:', registrations);

        if (registrations.length === 0) {
          this.studentsForDisciplineModal = [];
          return;
        }

        const studentIds = registrations
          .map((reg: any) => reg.studentId || reg.student?.id)
          .filter((id: any) => id);

        if (studentIds.length === 0) {
          this.studentsForDisciplineModal = [];
          return;
        }

        try {
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];

          this.studentsForDisciplineModal = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`
                };
              }
              const registration = registrations.find((reg: any) => (reg.studentId || reg.student?.id) === studentId);
              if (registration) {
                return {
                  id: studentId,
                  label: registration.studentFullName || `Élève ${studentId}`,
                  fullName: registration.studentFullName || `Élève ${studentId}`
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);

          console.log('Élèves chargés pour le modal de discipline:', this.studentsForDisciplineModal);
        } catch (error) {
          console.error('Erreur lors du chargement des élèves pour le modal de discipline:', error);
          this.studentsForDisciplineModal = registrations
            .filter((reg: any) => reg.studentId || reg.student?.id)
            .map((reg: any) => ({
              id: reg.studentId || reg.student?.id,
              label: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`),
              fullName: reg.studentFullName || (reg.student?.firstName && reg.student?.lastName
                ? `${reg.student.firstName} ${reg.student.lastName}`
                : `Élève ${reg.studentId || reg.student?.id}`)
            }));
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves pour le modal de discipline:', err);
        this.studentsForDisciplineModal = [];
      }
    });
  }

  handleDisciplineCancel(): void {
    this.isDisciplineModalVisible = false;
    this.editingDiscipline = null;
    this.disciplineForm.reset();
    this.studentsForDisciplineModal = [];
    this.selectedClassroomForDisciplineModal = null;
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

    // Si le record a une classe, charger les élèves de cette classe
    if (record.classRoomId) {
      this.selectedClassroomForDisciplineModal = record.classRoomId;
      this.loadStudentsForDisciplineModal(record.classRoomId);
    } else if (this.selectedClassroomForDiscipline) {
      // Sinon, utiliser la classe sélectionnée dans l'onglet
      this.selectedClassroomForDisciplineModal = this.selectedClassroomForDiscipline;
      this.disciplineForm.patchValue({ classRoomId: this.selectedClassroomForDiscipline });
      this.loadStudentsForDisciplineModal(this.selectedClassroomForDiscipline);
    }

    // Écouter les changements de classe dans le formulaire
    this.disciplineForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.selectedClassroomForDisciplineModal = classRoomId;
        this.loadStudentsForDisciplineModal(classRoomId);
      } else {
        this.studentsForDisciplineModal = [];
        this.disciplineForm.patchValue({ studentId: '' }, { emitEvent: false });
      }
    });
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

  // ========== ONGLET 5: ABSENCES ==========
  onClassroomSelectedForAbsence(classRoomId: string): void {
    console.log('Classe sélectionnée pour les absences:', classRoomId);
    this.selectedClassroomForAbsence = classRoomId;
    this.absences = [];
    this.selectedSubjectForAbsence = null;
    this.selectedDateForAbsence = null;

    if (classRoomId) {
      this.loadStudentsForAbsence(classRoomId);
    } else {
      this.studentsForAbsence = [];
    }
  }

  loadStudentsForAbsence(classRoomId: string): void {
    if (!classRoomId) {
      this.studentsForAbsence = [];
      return;
    }

    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        if (registrations.length === 0) {
          this.studentsForAbsence = [];
          return;
        }

        const studentIds = registrations
          .map((reg: any) => reg.studentId || reg.student?.id)
          .filter((id: any) => id);

        if (studentIds.length === 0) {
          this.studentsForAbsence = [];
          return;
        }

        try {
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];

          this.studentsForAbsence = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);
        } catch (error) {
          console.error('Erreur lors du chargement des élèves:', error);
          this.studentsForAbsence = [];
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves:', err);
        this.studentsForAbsence = [];
      }
    });
  }

  loadAbsences(): void {
    if (!this.selectedClassroomForAbsence) {
      this.absences = [];
      return;
    }

    this.loading = true;

    // Si tous les filtres sont sélectionnés, utiliser la méthode spécifique
    if (this.selectedSubjectForAbsence && this.selectedDateForAbsence) {
      const dateStr = typeof this.selectedDateForAbsence === 'string'
        ? this.selectedDateForAbsence
        : this.formatDate(this.selectedDateForAbsence);

      this.absenceService.getAbsencesByClassSubjectAndDate(
        this.selectedClassroomForAbsence,
        this.selectedSubjectForAbsence,
        dateStr
      ).subscribe({
        next: (res) => {
          this.absences = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des absences:', err);
          this.message.error('Erreur lors du chargement des absences');
          this.absences = [];
          this.loading = false;
        }
      });
    } else {
      // Sinon, charger toutes les absences de la classe
      this.absenceService.getAbsencesByClass(this.selectedClassroomForAbsence).subscribe({
        next: (res) => {
          let absences = res.data || [];

          // Filtrer par matière si sélectionnée
          if (this.selectedSubjectForAbsence) {
            absences = absences.filter((absence: any) =>
              absence.subjectId === this.selectedSubjectForAbsence ||
              absence.subject?.id === this.selectedSubjectForAbsence
            );
          }

          // Filtrer par date si sélectionnée
          if (this.selectedDateForAbsence) {
            const dateStr = typeof this.selectedDateForAbsence === 'string'
              ? this.selectedDateForAbsence
              : this.formatDate(this.selectedDateForAbsence);
            absences = absences.filter((absence: any) => {
              const absenceDate = absence.date?.split('T')[0] || absence.date;
              return absenceDate === dateStr;
            });
          }

          this.absences = absences;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des absences:', err);
          this.message.error('Erreur lors du chargement des absences');
          this.absences = [];
          this.loading = false;
        }
      });
    }
  }

  loadStudentAbsences(): void {
    if (!this.selectedStudentForAbsenceReport || !this.startDateForAbsence || !this.endDateForAbsence) {
      this.absences = [];
      this.totalAbsenceHours = 0;
      return;
    }

    this.loading = true;
    const startDateStr = typeof this.startDateForAbsence === 'string'
      ? this.startDateForAbsence
      : this.formatDate(this.startDateForAbsence);
    const endDateStr = typeof this.endDateForAbsence === 'string'
      ? this.endDateForAbsence
      : this.formatDate(this.endDateForAbsence);

    // Charger les absences
    this.absenceService.getAbsencesByStudentAndDateRange(
      this.selectedStudentForAbsenceReport,
      { startDate: startDateStr, endDate: endDateStr }
    ).subscribe({
      next: (res) => {
        this.absences = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des absences:', err);
        this.absences = [];
        this.loading = false;
      }
    });

    // Charger le total d'heures
    this.absenceService.getTotalAbsenceHoursByStudent(
      this.selectedStudentForAbsenceReport,
      { startDate: startDateStr, endDate: endDateStr }
    ).subscribe({
      next: (res) => {
        this.totalAbsenceHours = res.data?.totalHours || 0;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du total d\'heures:', err);
        this.totalAbsenceHours = 0;
      }
    });
  }

  openAbsenceModal(): void {
    this.isAbsenceModalVisible = true;
    this.editingAbsence = null;
    this.absenceForm.reset({
      numberOfHours: 1,
      absentStudentIds: [],
      notes: ''
    });
    this.studentsForAbsenceModal = [];
    this.schedules = [];
    this.selectedClassroomForAbsenceModal = null;

    // Pré-remplir avec les valeurs de l'onglet si disponibles
    if (this.schoolId) {
      this.absenceForm.patchValue({ schoolId: this.schoolId });
    }
    if (this.selectedClassroomForAbsence) {
      this.selectedClassroomForAbsenceModal = this.selectedClassroomForAbsence;
      this.absenceForm.patchValue({ classRoomId: this.selectedClassroomForAbsence });
      this.loadStudentsForAbsenceModal(this.selectedClassroomForAbsence);
      this.loadSchedulesForClassroom(this.selectedClassroomForAbsence);
    }
    if (this.selectedSubjectForAbsence) {
      this.absenceForm.patchValue({ subjectId: this.selectedSubjectForAbsence });
    }
    if (this.selectedDateForAbsence) {
      const dateStr = typeof this.selectedDateForAbsence === 'string'
        ? this.selectedDateForAbsence
        : this.formatDate(this.selectedDateForAbsence);
      this.absenceForm.patchValue({ date: dateStr });
    }

    // Écouter les changements de classe dans le formulaire
    this.absenceForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.selectedClassroomForAbsenceModal = classRoomId;
        this.loadStudentsForAbsenceModal(classRoomId);
        this.loadSchedulesForClassroom(classRoomId);
      } else {
        this.studentsForAbsenceModal = [];
        this.schedules = [];
        this.absenceForm.patchValue({ absentStudentIds: [] }, { emitEvent: false });
      }
    });
  }

  onClassroomSelectedForAbsenceModal(classRoomId: string): void {
    if (classRoomId) {
      this.loadStudentsForAbsenceModal(classRoomId);
      this.loadSchedulesForClassroom(classRoomId);
    }
  }

  loadStudentsForAbsenceModal(classRoomId: string): void {
    if (!classRoomId) {
      this.studentsForAbsenceModal = [];
      return;
    }

    this.registrationService.getRegistrationsByClass(classRoomId).subscribe({
      next: async (res) => {
        const registrations = res.data || [];
        if (registrations.length === 0) {
          this.studentsForAbsenceModal = [];
          return;
        }

        const studentIds = registrations
          .map((reg: any) => reg.studentId || reg.student?.id)
          .filter((id: any) => id);

        if (studentIds.length === 0) {
          this.studentsForAbsenceModal = [];
          return;
        }

        try {
          const studentsRes = await firstValueFrom(this.usersService.getStudents());
          const allStudents = studentsRes.data?.content || [];

          this.studentsForAbsenceModal = studentIds
            .map((studentId: string) => {
              const student = allStudents.find((s: any) => s.id === studentId);
              if (student) {
                return {
                  id: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                  fullName: `${student.firstName} ${student.lastName}`
                };
              }
              return null;
            })
            .filter((s: any) => s !== null);
        } catch (error) {
          console.error('Erreur lors du chargement des élèves:', error);
          this.studentsForAbsenceModal = [];
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des élèves:', err);
        this.studentsForAbsenceModal = [];
      }
    });
  }

  loadSchedulesForClassroom(classRoomId: string): void {
    if (!classRoomId || !this.schoolId) {
      this.schedules = [];
      return;
    }

    this.scheduleService.getByClassroom(this.schoolId, classRoomId).subscribe({
      next: (res) => {
        this.schedules = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des horaires:', err);
        this.schedules = [];
      }
    });
  }

  getScheduleLabel(schedule: any): string {
    if (!schedule) return '';
    const day = schedule.dayOfWeek || '';
    const startTime = schedule.startTime || '';
    const endTime = schedule.endTime || '';
    const subject = schedule.subject?.name || '';
    return `${day} ${startTime}-${endTime} ${subject ? `(${subject})` : ''}`.trim();
  }

  handleAbsenceCancel(): void {
    this.isAbsenceModalVisible = false;
    this.editingAbsence = null;
    this.absenceForm.reset();
    this.studentsForAbsenceModal = [];
    this.schedules = [];
    this.selectedClassroomForAbsenceModal = null;
  }

  submitAbsence(): void {
    if (this.absenceForm.invalid) {
      Object.keys(this.absenceForm.controls).forEach(key => {
        this.absenceForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmittingAbsence = true;
    const formValue = this.absenceForm.value;

    // Formater la date
    const dateStr = typeof formValue.date === 'string'
      ? formValue.date
      : this.formatDate(formValue.date);

    const payload: CreateAbsenceRequest = {
      schoolId: formValue.schoolId || this.schoolId || '',
      classRoomId: formValue.classRoomId,
      subjectId: formValue.subjectId,
      date: dateStr,
      absentStudentIds: formValue.absentStudentIds || [],
      numberOfHours: formValue.numberOfHours,
      scheduleId: formValue.scheduleId || undefined,
      notes: formValue.notes || undefined
    };

    if (this.editingAbsence) {
      this.absenceService.updateAbsence(this.editingAbsence.id, payload).subscribe({
        next: (res) => {
          this.message.success('Absences mises à jour avec succès !');
          this.isSubmittingAbsence = false;
          this.isAbsenceModalVisible = false;
          this.handleAbsenceCancel();
          // Mettre à jour les filtres avec les valeurs du formulaire et recharger
          this.selectedClassroomForAbsence = formValue.classRoomId;
          this.selectedSubjectForAbsence = formValue.subjectId;
          this.selectedDateForAbsence = dateStr;
          this.loadAbsences();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error(err?.error?.message || 'Erreur lors de la mise à jour');
          this.isSubmittingAbsence = false;
        }
      });
    } else {
      this.absenceService.createAbsence(payload).subscribe({
        next: (res) => {
          this.message.success('Absences enregistrées avec succès !');
          this.isSubmittingAbsence = false;
          this.isAbsenceModalVisible = false;
          this.handleAbsenceCancel();
          // Mettre à jour les filtres avec les valeurs du formulaire et recharger
          this.selectedClassroomForAbsence = formValue.classRoomId;
          this.selectedSubjectForAbsence = formValue.subjectId;
          this.selectedDateForAbsence = dateStr;
          this.loadAbsences();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message.error(err?.error?.message || 'Erreur lors de l\'enregistrement');
          this.isSubmittingAbsence = false;
        }
      });
    }
  }

  editAbsence(absence: any): void {
    this.editingAbsence = absence;
    this.absenceForm.patchValue({
      schoolId: absence.schoolId || this.schoolId,
      classRoomId: absence.classRoomId,
      subjectId: absence.subjectId,
      date: absence.date,
      absentStudentIds: absence.absentStudentIds || [],
      numberOfHours: absence.numberOfHours,
      scheduleId: absence.scheduleId || '',
      notes: absence.notes || ''
    });
    this.isAbsenceModalVisible = true;

    // Charger les élèves de la classe
    if (absence.classRoomId) {
      this.selectedClassroomForAbsenceModal = absence.classRoomId;
      this.loadStudentsForAbsenceModal(absence.classRoomId);
      this.loadSchedulesForClassroom(absence.classRoomId);
    }

    // Écouter les changements de classe
    this.absenceForm.get('classRoomId')?.valueChanges.subscribe(classRoomId => {
      if (classRoomId) {
        this.selectedClassroomForAbsenceModal = classRoomId;
        this.loadStudentsForAbsenceModal(classRoomId);
        this.loadSchedulesForClassroom(classRoomId);
      }
    });
  }

  deleteAbsence(absence: any): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) return;

    this.absenceService.deleteAbsence(absence.id).subscribe({
      next: () => {
        this.message.success('Absence supprimée avec succès !');
        this.loadAbsences();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message.error('Erreur lors de la suppression');
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    // Si c'est un objet avec des propriétés de date
    const year = date.getFullYear?.() || date.year;
    const month = (date.getMonth?.() !== undefined ? date.getMonth() + 1 : date.month)?.toString().padStart(2, '0');
    const day = (date.getDate?.() || date.day)?.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
