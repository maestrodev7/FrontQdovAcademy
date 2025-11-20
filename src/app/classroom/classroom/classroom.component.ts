import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DynamicTableComponent } from '../ui/dynamic-table/dynamic-table.component';
import { AddClassroomComponent } from '../add-classroom/add-classroom.component';
import { ClassroomService } from '../services/classroom.service';
import { SeriesService } from '../services/series.service';
import { ClassLevelService } from '../services/class-level.service';
import { SchoolService } from '../../school/services/school.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    DynamicTableComponent,
    AddClassroomComponent
  ],
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent implements OnInit {

  isModalVisible = false;
  isSubmitting = false;
  classroomForm!: FormGroup;
  formError: string = '';

  columns = [
    { key: 'label', label: 'Nom de la classe' },
    { key: 'classLevelName', label: 'Niveau' },
    { key: 'seriesName', label: 'Série' },
    { key: 'schoolName', label: 'École' }
  ];

  classrooms: any[] = [];
  series: any[] = [];
  levels: any[] = [];
  schools: any[] = [];

  constructor(
    private fb: FormBuilder,
    private classroomService: ClassroomService,
    private seriesService: SeriesService,
    private classLevelService: ClassLevelService,
    private schoolService: SchoolService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferenceData();
  }

private initForm(): void {
  const schoolId = localStorage.getItem('schoolId') || '';

  this.classroomForm = this.fb.group({
    label: ['', Validators.required],
    classLevelId: ['', Validators.required],
    seriesId: ['', Validators.required],
    schoolId: [schoolId, Validators.required], // Pré-rempli automatiquement depuis localStorage
  });
}


  openModal(): void {
    // S'assurer que schoolId est toujours à jour depuis localStorage
    const schoolId = localStorage.getItem('schoolId') || '';
    this.classroomForm.patchValue({ schoolId });
    
    this.isModalVisible = true;
    this.formError = '';
    this.classroomForm.reset();
    // Réinitialiser schoolId après reset
    this.classroomForm.patchValue({ schoolId });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.classroomForm.reset();
    // Réinitialiser schoolId après reset
    const schoolId = localStorage.getItem('schoolId') || '';
    this.classroomForm.patchValue({ schoolId });
  }

  onFormChange(value: any): void {
    this.classroomForm.patchValue(value);
  }

  submitForm(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.classroomForm.controls).forEach(key => {
      this.classroomForm.get(key)?.markAsTouched();
    });

    // S'assurer que schoolId est toujours présent
    const schoolId = localStorage.getItem('schoolId') || '';
    if (!schoolId) {
      this.formError = 'Aucune école sélectionnée. Veuillez sélectionner une école d\'abord.';
      this.message.error('Aucune école sélectionnée');
      return;
    }
    this.classroomForm.patchValue({ schoolId });

    if (this.classroomForm.invalid) {
      this.formError = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    this.classroomService.createClassroom(this.classroomForm.value).subscribe({
      next: (res) => {
        // Récupérer les informations pour l'ajout direct au tableau
        const newClassroom = {
          ...res.data,
          classLevelName: this.levels.find(l => l.id === res.data?.classLevelId)?.name || '—',
          seriesName: this.series.find(s => s.id === res.data?.seriesId)?.name || '—',
          schoolName: this.schools.find(e => e.id === res.data?.schoolId)?.name || '—',
        };

        // Ajouter la nouvelle classe au début du tableau
        this.classrooms = [newClassroom, ...this.classrooms];

        this.message.success('Classe créée avec succès !');
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.classroomForm.reset();
        // Réinitialiser schoolId après reset
        this.classroomForm.patchValue({ schoolId });
        this.formError = '';
      },
      error: (err) => {
        console.error('❌ Erreur :', err);
        this.isSubmitting = false;
        
        // Extraire les messages d'erreur de l'API
        const errorMessage = this.extractErrorMessage(err);
        
        this.formError = errorMessage;
        this.message.error(errorMessage);
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) {
      return 'Une erreur est survenue lors de la création de la classe.';
    }

    const errorObj = err.error;
    
    // Si c'est un objet avec des propriétés correspondant aux champs du formulaire
    if (typeof errorObj === 'object' && !errorObj.message && !errorObj.error) {
      const fieldErrors: string[] = [];
      
      // Parcourir toutes les propriétés de l'objet d'erreur
      Object.keys(errorObj).forEach(key => {
        const errorValue = errorObj[key];
        if (typeof errorValue === 'string') {
          // Mapper les noms de champs pour un affichage plus lisible
          const fieldName = this.getFieldLabel(key);
          fieldErrors.push(`${fieldName}: ${errorValue}`);
        } else if (Array.isArray(errorValue)) {
          // Si c'est un tableau de messages
          const fieldName = this.getFieldLabel(key);
          fieldErrors.push(`${fieldName}: ${errorValue.join(', ')}`);
        }
      });
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('\n');
      }
    }
    
    // Messages d'erreur généraux
    return errorObj.message || 
           errorObj.error || 
           (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue lors de la création de la classe.');
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'label': 'Nom de la classe',
      'classLevelId': 'Niveau',
      'seriesId': 'Série',
      'schoolId': 'École'
    };
    return labels[fieldName] || fieldName;
  }

  private async loadReferenceData(): Promise<void> {
    try {
      const [seriesRes, levelRes, schoolRes] = await Promise.all([
        firstValueFrom(this.seriesService.getSeries()),
        firstValueFrom(this.classLevelService.getClassLevels()),
        firstValueFrom(this.schoolService.getSchools())
      ]);

      this.series = seriesRes?.data ?? [];
      this.levels = levelRes?.data ?? [];
      this.schools = schoolRes?.data ?? [];

      this.loadClassrooms();
    } catch (error) {
      console.error('Erreur de chargement des données de référence', error);
    }
  }

  private loadClassrooms(): void {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) return;

    this.classroomService.getClassroomsBySchool(schoolId).subscribe({
      next: (res) => {
        this.classrooms = (res.data ?? []).map((cls: any) => ({
          ...cls,
          classLevelName: this.levels.find(l => l.id === cls.classLevelId)?.name || '—',
          seriesName: this.series.find(s => s.id === cls.seriesId)?.name || '—',
          schoolName: this.schools.find(e => e.id === cls.schoolId)?.name || '—',
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes', err);
      }
    });
  }

}
