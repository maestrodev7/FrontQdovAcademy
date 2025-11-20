import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AddParentComponent } from '../add-parent/add-parent.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../classroom/ui/dynamic-table/dynamic-table.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-parents',
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css'],
  standalone: true,
  imports: [
    NzButtonModule,
    AddParentComponent,
    NzModalModule,
    NzGridModule,
    NzDividerModule,
    ReactiveFormsModule,
    CommonModule,
    DynamicTableComponent,
  ],
})
export class ParentsComponent implements OnInit {
    isModalVisible = false;
    isSubmitting = false;
    parentForm!: FormGroup;
    parents: any[] = [];
    formError: string = '';

  columns = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' }
  ];
  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadParents();
    this.parentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  openModal(): void {
    this.isModalVisible = true;
    this.formError = '';
    this.parentForm.reset();
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.formError = '';
    this.parentForm.reset();
  }

  onFormChange(formValue: any): void {
    this.parentForm.patchValue(formValue);
  }

submitForm(): void {
  // Marquer tous les champs comme touchés pour afficher les erreurs
  Object.keys(this.parentForm.controls).forEach(key => {
    this.parentForm.get(key)?.markAsTouched();
  });

  if (this.parentForm.invalid) {
    this.formError = 'Veuillez remplir tous les champs requis correctement.';
    return;
  }

  this.isSubmitting = true;
  this.formError = '';
  const payload = {
    ...this.parentForm.value,
    roles: ['PARENT'],
  };

  this.userService.createUser(payload).subscribe({
    next: (res) => {
      const newParent = {
        id: res.data?.id || res.data?.userId || payload.username,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: 'PARENT',
      };

      this.parents = [newParent, ...this.parents];
      
      this.message.success('Parent créé avec succès !');
      this.isSubmitting = false;
      this.isModalVisible = false;
      this.parentForm.reset();
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

private extractErrorMessage(err: any): string {
  if (!err?.error) {
    return 'Une erreur est survenue lors de la création du parent.';
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
         (typeof errorObj === 'string' ? errorObj : 'Une erreur est survenue lors de la création du parent.');
}

private getFieldLabel(fieldName: string): string {
  const labels: { [key: string]: string } = {
    'firstName': 'Prénom',
    'lastName': 'Nom',
    'username': 'Nom d\'utilisateur',
    'email': 'Email',
    'phoneNumber': 'Téléphone',
    'password': 'Mot de passe'
  };
  return labels[fieldName] || fieldName;
}



private loadParents(): void {
  this.userService.getParents().subscribe({
    next: (res) => {
      this.parents = (res.data?.content ?? []).map((parent: any) => ({
        id: parent.id,
        fullName: `${parent.firstName} ${parent.lastName}`,
        email: parent.email,
        phoneNumber: parent.phoneNumber,
        role: parent.roles?.join(', ') || 'PARENT',
      }));
    },
    error: (err) => {
      console.error('Erreur de chargement des parents:', err);
    },
  });
}


}
