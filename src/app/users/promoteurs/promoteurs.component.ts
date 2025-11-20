import { Component, OnInit } from '@angular/core';
import { DynamicTableComponent } from '../../classroom/ui/dynamic-table/dynamic-table.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddAdminComponent } from '../add-admin/add-admin.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SchoolService } from '../../school/services/school.service';

interface SchoolPromoteur {
  id: string;
  role: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    roles: string[];
  };
  school: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
    email: string | null;
  };
}

@Component({
  selector: 'app-promoteurs',
  templateUrl: './promoteurs.component.html',
  styleUrls: ['./promoteurs.component.css'],
  standalone: true,
  imports: [
    DynamicTableComponent,
    NzButtonModule,
    AddAdminComponent,
    NzModalModule,
    NzGridModule,
    NzDividerModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class PromoteursComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  promoteurForm!: FormGroup;
  promoteurs: any[] = [];
  formError: string = '';
  schools: any[] = [];

  columns = [
    { key: 'schoolName', label: 'École' },
    { key: 'address', label: 'Adresse' },
    { key: 'promoteurName', label: 'Promoteur' },
    { key: 'phoneNumber', label: 'Téléphone' },
    { key: 'email', label: 'Email' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private message: NzMessageService,
    private schoolService: SchoolService
  ) {}

  ngOnInit(): void {
    this.promoteurForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
      schoolId: ['', Validators.required],
    });
    this.loadPromoteurs();
    this.loadSchools();
  }

  loadSchools(): void {
    this.schoolService.getSchools().subscribe({
      next: (res) => {
        this.schools = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des écoles:', err);
      }
    });
  }

  loadPromoteurs(): void {
    this.userService.getSchoolsWithPromoteurs().subscribe({
      next: (res) => {
        // Transformer les données pour le format attendu par DynamicTableComponent
        this.promoteurs = res.data.map((item: SchoolPromoteur) => ({
          id: item.id,
          schoolName: item.school.name,
          address: item.school.address,
          promoteurName: `${item.user.firstName} ${item.user.lastName}`,
          phoneNumber: item.user.phoneNumber,
          email: item.user.email
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des promoteurs:', err);
      }
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.formError = '';
    this.promoteurForm.reset();
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.promoteurForm.reset();
  }

  onFormChange(formValue: any): void {
    this.promoteurForm.patchValue(formValue);
  }

  private extractErrorMessage(err: any): string {
    if (!err?.error) {
      return 'Une erreur est survenue lors de la création du promoteur.';
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
           (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue lors de la création du promoteur.');
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'firstName': 'Prénom',
      'lastName': 'Nom',
      'username': 'Nom d\'utilisateur',
      'email': 'Email',
      'phoneNumber': 'Téléphone',
      'password': 'Mot de passe',
      'schoolId': 'École'
    };
    return labels[fieldName] || fieldName;
  }

  submitForm(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.promoteurForm.controls).forEach(key => {
      this.promoteurForm.get(key)?.markAsTouched();
    });

    if (this.promoteurForm.invalid) {
      this.formError = 'Veuillez remplir tous les champs requis correctement.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    const payload = this.promoteurForm.value;

    this.userService.createPromoteurForSchool(payload).subscribe({
      next: (res) => {
        // Récupérer les informations de l'école sélectionnée
        const selectedSchool = this.schools.find(s => s.id === payload.schoolId);

        // La réponse peut être celle de assignUserToSchool qui retourne l'association user-school
        // ou celle de createUser. On extrait l'ID de l'association ou on génère un ID temporaire
        const associationId = res?.data?.id || res?.id || res?.data?.userSchoolId || Date.now().toString();

        // Créer l'objet promoteur pour l'ajouter directement au tableau
        const newPromoteur = {
          id: associationId,
          schoolName: selectedSchool?.name || '',
          address: selectedSchool?.address || '',
          promoteurName: `${payload.firstName} ${payload.lastName}`,
          phoneNumber: payload.phoneNumber,
          email: payload.email
        };

        // Ajouter le nouveau promoteur au début du tableau
        this.promoteurs = [newPromoteur, ...this.promoteurs];

        this.message.success('Promoteur créé avec succès !');
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.promoteurForm.reset();
        this.formError = '';
      },
      error: (err) => {
        console.error('❌ Erreur :', err);
        this.isSubmitting = false;

        // Extraire les messages d'erreur de l'API
        const errorMessage = this.extractErrorMessage(err);

        this.formError = errorMessage;
        this.message.error(errorMessage);
      },
    });
  }
}

