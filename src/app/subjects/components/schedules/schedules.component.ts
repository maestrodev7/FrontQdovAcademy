import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ScheduleService } from '../../services/schedule.service';
import { TeacherSubjectService } from '../../services/teacher-subject.service';
import { ClassroomService } from '../../../classroom/services/classroom.service';
import { ClassroomSubjectService } from '../../services/classroom-subject.service';
import { SchoolService } from '../../../school/services/school.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzSelectModule,
    NzInputModule,
    NzTimePickerModule,
    NzDatePickerModule,
    NzTableModule,
    NzSpinModule,
    NzTagModule,
    NzIconModule,
  ],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent implements OnInit {
  schedules: any[] = [];
  classrooms: any[] = [];
  classroomSubjects: any[] = [];
  teacherSubjects: any[] = [];
  loading = false;
  schoolId: string | null = null;
  selectedClassroomId: string | null = null;
  selectedDay: string | null = null;
  currentAcademicYear: any = null;

  isModalVisible = false;
  isSubmitting = false;
  scheduleForm!: FormGroup;
  formError: string = '';
  editingSchedule: any = null;
  isTeacher = false;

  daysOfWeek = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' },
    { value: 'SUNDAY', label: 'Dimanche' }
  ];

  displayedColumns = [
    { key: 'dayOfWeek', label: 'Jour' },
    { key: 'time', label: 'Horaire' },
    { key: 'subject', label: 'Matière' },
    { key: 'teacher', label: 'Enseignant' },
    { key: 'room', label: 'Salle' },
    { key: 'actions', label: 'Actions' }
  ];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private teacherSubjectService: TeacherSubjectService,
    private classroomService: ClassroomService,
    private classroomSubjectService: ClassroomSubjectService,
    private schoolService: SchoolService,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.schoolId = localStorage.getItem('schoolId');
    if (!this.schoolId) {
      this.message.warning('Aucune école sélectionnée');
      return;
    }
    this.checkUserRole();
    this.initForm();
    await this.loadAcademicYear();
    this.loadClassrooms();
    this.loadTeacherSubjects();
  }

  private checkUserRole(): void {
    const user = this.authService.getUser();
    if (user) {
      const role = Array.isArray(user.roles) ? user.roles[0] : user.role || user.roles;
      this.isTeacher = (typeof role === 'string' && (role.includes('ENSEIGNANT') || role.includes('TEACHER'))) ||
                       (typeof user.roles === 'string' && (user.roles.includes('ENSEIGNANT') || user.roles.includes('TEACHER')));
    }
  }

  async loadAcademicYear(): Promise<void> {
    try {
      const yearsRes = await firstValueFrom(this.schoolService.getAcademicYears());
      const academicYears = (yearsRes.data || []).map((year: any) => ({
        id: year.id,
        label: `${year.startDate} - ${year.endDate}`,
        startDate: year.startDate,
        endDate: year.endDate,
        active: year.active
      }));
      
      this.currentAcademicYear = academicYears.find((year: any) => year.active === true);
      if (!this.currentAcademicYear && academicYears.length > 0) {
        this.currentAcademicYear = academicYears[0];
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'année académique:', error);
    }
  }

  private initForm(): void {
    this.scheduleForm = this.fb.group({
      classRoomId: ['', Validators.required],
      classRoomSubjectId: [''],
      subjectId: [''],
      teacherSubjectId: ['', Validators.required],
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      room: [''],
      notes: ['']
    });
  }

  loadClassrooms(): void {
    if (!this.schoolId) return;
    this.loading = true;
    this.classroomService.getClassroomsBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.classrooms = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes:', err);
        this.message.error('Impossible de charger les classes');
        this.loading = false;
      }
    });
  }

  loadTeacherSubjects(): void {
    if (!this.schoolId) return;
    this.teacherSubjectService.getAllBySchool(this.schoolId).subscribe({
      next: (res) => {
        this.teacherSubjects = (res.data || []).map((ts: any) => ({
          id: ts.id,
          userSchoolId: ts.userSchoolId,
          subjectId: ts.subjectId,
          subjectName: ts.subject?.name || '',
          subjectCode: ts.subject?.code || '',
          teacherName: ts.teacher ? `${ts.teacher.firstName} ${ts.teacher.lastName}` : '',
          specialization: ts.specialization || ''
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des associations enseignant-matière:', err);
      }
    });
  }

  onClassroomChange(classroomId: string): void {
    this.selectedClassroomId = classroomId;
    if (classroomId) {
      this.loadClassroomSubjects(classroomId);
      this.loadSchedules(classroomId);
    } else {
      this.classroomSubjects = [];
      this.schedules = [];
    }
  }

  loadClassroomSubjects(classroomId: string): void {
    this.classroomSubjectService.getByClassroom(classroomId).subscribe({
      next: (res) => {
        this.classroomSubjects = (res.data || []).map((cs: any) => ({
          id: cs.id,
          subjectId: cs.subjectId,
          subjectName: cs.subjectName || cs.subject?.name || '',
          subjectCode: cs.subjectCode || cs.subject?.code || '',
          coefficient: cs.coefficient || 1
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des matières de la classe:', err);
      }
    });
  }

  loadSchedules(classroomId?: string): void {
    if (!this.schoolId) return;
    this.loading = true;
    
    // Utiliser l'endpoint avec academic-year si disponible
    let loadObservable;
    if (this.currentAcademicYear) {
      // Si on a une année académique, utiliser l'endpoint filtré par année académique
      loadObservable = this.scheduleService.getByAcademicYear(this.schoolId, this.currentAcademicYear.id);
    } else {
      // Sinon, utiliser les endpoints normaux
      loadObservable = classroomId
        ? this.scheduleService.getByClassroom(this.schoolId, classroomId)
        : this.scheduleService.getAllBySchool(this.schoolId);
    }

    loadObservable.subscribe({
      next: (res) => {
        let schedules = (res.data || []).map((schedule: any) => ({
          id: schedule.id,
          classRoomId: schedule.classRoomId,
          classRoomLabel: schedule.classRoom?.label || schedule.classRoomSubject?.classRoomLabel || '',
          classRoomSubjectId: schedule.classRoomSubjectId,
          teacherSubjectId: schedule.teacherSubjectId,
          subjectId: schedule.classRoomSubject?.subjectId || schedule.teacherSubject?.subjectId || schedule.teacherSubject?.subject?.id,
          subjectName: schedule.classRoomSubject?.subjectName || schedule.teacherSubject?.subject?.name || '',
          subjectCode: schedule.classRoomSubject?.subjectCode || schedule.teacherSubject?.subject?.code || '',
          teacherName: schedule.teacherSubject?.teacher ?
            `${schedule.teacherSubject.teacher.firstName} ${schedule.teacherSubject.teacher.lastName}` :
            'Non assigné',
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration || this.calculateDuration(schedule.startTime, schedule.endTime),
          room: schedule.room || '',
          notes: schedule.notes || ''
        }));
        
        // Filtrer par classe si spécifiée (même si on utilise l'endpoint academic-year)
        if (classroomId) {
          schedules = schedules.filter(s => s.classRoomId === classroomId);
        }
        
        this.schedules = schedules;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'emploi du temps:', err);
        this.message.error('Impossible de charger l\'emploi du temps');
        this.loading = false;
        this.schedules = [];
      }
    });
  }

  calculateDuration(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '';
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins}min`;
  }

  openModal(): void {
    if (!this.selectedClassroomId) {
      this.message.warning('Veuillez sélectionner une classe d\'abord');
      return;
    }
    this.editingSchedule = null;
    this.scheduleForm.reset();
    this.scheduleForm.patchValue({ classRoomId: this.selectedClassroomId });
    this.formError = '';
    this.isModalVisible = true;
  }

  openEditModal(schedule: any): void {
    this.editingSchedule = schedule;
    const startTime = schedule.startTime.substring(0, 5);
    const endTime = schedule.endTime.substring(0, 5);

    // Charger les matières de la classe si nécessaire
    if (schedule.classRoomId && this.classroomSubjects.length === 0) {
      this.loadClassroomSubjects(schedule.classRoomId);
    }

    this.scheduleForm.patchValue({
      classRoomId: schedule.classRoomId,
      classRoomSubjectId: schedule.classRoomSubjectId,
      subjectId: schedule.subjectId,
      teacherSubjectId: schedule.teacherSubjectId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: startTime,
      endTime: endTime,
      room: schedule.room,
      notes: schedule.notes
    });
    this.formError = '';
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.editingSchedule = null;
    this.scheduleForm.reset();
  }

  onClassroomSubjectChange(): void {
    const classRoomSubjectId = this.scheduleForm.value.classRoomSubjectId;
    if (classRoomSubjectId) {
      const classroomSubject = this.classroomSubjects.find(cs => cs.id === classRoomSubjectId);
      if (classroomSubject) {
        // Filtrer les teacherSubjects pour cette matière
        const availableTeacherSubjects = this.teacherSubjects.filter(
          ts => ts.subjectId === classroomSubject.subjectId
        );
        // Mettre à jour la liste des teacherSubjects disponibles
        this.scheduleForm.patchValue({ subjectId: classroomSubject.subjectId });
      }
    }
  }

  submitForm(): void {
    if (!this.schoolId) {
      this.formError = 'Aucune école sélectionnée.';
      return;
    }

    Object.keys(this.scheduleForm.controls).forEach(key => {
      this.scheduleForm.get(key)?.markAsTouched();
    });

    if (this.scheduleForm.invalid) {
      this.formError = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    // Validation des heures
    const startTime = this.scheduleForm.value.startTime;
    const endTime = this.scheduleForm.value.endTime;
    if (startTime >= endTime) {
      this.formError = 'L\'heure de fin doit être supérieure à l\'heure de début.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    const formValue = this.scheduleForm.value;
    const payload = {
      classRoomId: formValue.classRoomId,
      classRoomSubjectId: formValue.classRoomSubjectId || undefined,
      subjectId: formValue.subjectId || undefined,
      teacherSubjectId: formValue.teacherSubjectId,
      schoolId: this.schoolId,
      dayOfWeek: formValue.dayOfWeek,
      startTime: `${formValue.startTime}:00`,
      endTime: `${formValue.endTime}:00`,
      room: formValue.room || undefined,
      notes: formValue.notes || undefined
    };

    if (this.editingSchedule) {
      const updatePayload = {
        schoolId: this.schoolId,
        subjectId: this.editingSchedule.subjectId || formValue.subjectId,
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
        room: payload.room,
        notes: payload.notes
      };
      this.scheduleService.update(this.schoolId, this.editingSchedule.id, updatePayload).subscribe({
        next: (res) => {
          this.message.success('Créneau mis à jour avec succès !');
          this.isSubmitting = false;
          this.isModalVisible = false;
          this.handleCancel();
          this.loadSchedules(this.selectedClassroomId || undefined);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      this.scheduleService.create(this.schoolId, payload).subscribe({
        next: (res) => {
          this.message.success('Créneau créé avec succès !');
          this.isSubmitting = false;
          this.isModalVisible = false;
          this.handleCancel();
          this.loadSchedules(this.selectedClassroomId || undefined);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  deleteSchedule(schedule: any): void {
    if (!this.schoolId) return;

    this.scheduleService.delete(this.schoolId, schedule.id).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(s => s.id !== schedule.id);
        this.message.success('Créneau supprimé avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        const errorMessage = this.extractErrorMessage(err);
        this.message.error(errorMessage);
      }
    });
  }

  getDayLabel(day: string): string {
    const dayObj = this.daysOfWeek.find(d => d.value === day);
    return dayObj ? dayObj.label : day;
  }

  getFilteredSchedules(): any[] {
    let filtered = this.schedules;
    if (this.selectedClassroomId) {
      filtered = filtered.filter(s => s.classRoomId === this.selectedClassroomId);
    }
    if (this.selectedDay) {
      filtered = filtered.filter(s => s.dayOfWeek === this.selectedDay);
    }
    return filtered.sort((a, b) => {
      const dayOrder = this.daysOfWeek.map(d => d.value);
      const dayDiff = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  private handleError(err: any): void {
    console.error('❌ Erreur :', err);
    this.isSubmitting = false;

    const errorMessage = this.extractErrorMessage(err);

    this.formError = errorMessage;
    this.message.error(errorMessage);
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) {
      return 'Une erreur est survenue.';
    }

    const errorObj = err.error;

    if (typeof errorObj === 'object' && !errorObj.message && !errorObj.error) {
      const messages: string[] = [];

      Object.keys(errorObj).forEach((key) => {
        const errorValue = errorObj[key];

        if (typeof errorValue === 'string') {
          messages.push(`${this.mapFieldLabel(key)}: ${errorValue}`);
        } else if (Array.isArray(errorValue)) {
          messages.push(`${this.mapFieldLabel(key)}: ${errorValue.join(', ')}`);
        }
      });

      if (messages.length) {
        return messages.join('\n');
      }
    }

    return errorObj.message || errorObj.error || (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue.');
  }

  private mapFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      classRoomId: 'Classe',
      classRoomSubjectId: 'Association classe-matière',
      subjectId: 'Matière',
      teacherSubjectId: 'Enseignant-Matière',
      dayOfWeek: 'Jour',
      startTime: 'Heure de début',
      endTime: 'Heure de fin',
      room: 'Salle',
      notes: 'Notes'
    };
    return labels[field] || field;
  }

  getAvailableTeacherSubjects(): any[] {
    if (!this.scheduleForm.value.classRoomSubjectId) {
      return this.teacherSubjects;
    }

    const classroomSubject = this.classroomSubjects.find(cs => cs.id === this.scheduleForm.value.classRoomSubjectId);
    if (classroomSubject) {
      return this.teacherSubjects.filter(ts => ts.subjectId === classroomSubject.subjectId);
    }
    return this.teacherSubjects;
  }
}

