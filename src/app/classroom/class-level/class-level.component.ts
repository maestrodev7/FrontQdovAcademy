import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DynamicTableComponent } from '../ui/dynamic-table/dynamic-table.component';
import { AddClassLevelComponent } from '../add-class-level/add-class-level.component';
import { ClassLevelService } from '../services/class-level.service';

@Component({
  selector: 'app-class-level',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzModalModule,
    DynamicTableComponent,
    AddClassLevelComponent
  ],
  templateUrl: './class-level.component.html',
  styleUrls: ['./class-level.component.css']
})
export class ClassLevelComponent implements OnInit {

  isModalVisible = false;
  isSubmitting = false;
  classLevelForm!: FormGroup;

  columns = [
    { key: 'name', label: 'Nom du niveau' }
  ];

  classLevels: any[] = [];

  constructor(
    private fb: FormBuilder,
    private classLevelService: ClassLevelService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClassLevels();
  }

  private initForm(): void {
    this.classLevelForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  openModal(): void {
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  onFormChange(value: any): void {
    this.classLevelForm.patchValue(value);
  }

  submitForm(): void {
    if (this.classLevelForm.invalid) return;

    this.isSubmitting = true;
    this.classLevelService.createClassLevel(this.classLevelForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.loadClassLevels();
      },
      error: (err) => {
        console.error('Erreur lors de la création du niveau :', err);
        this.isSubmitting = false;
      }
    });
  }

  private loadClassLevels(): void {
    this.classLevelService.getClassLevels().subscribe({
      next: (res) => {
        this.classLevels = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des niveaux de classe :', err);
      }
    });
  }
}
