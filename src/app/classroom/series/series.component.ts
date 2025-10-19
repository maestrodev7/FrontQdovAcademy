import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../ui/dynamic-table/dynamic-table.component';
import { SeriesService } from '../services/series.service';
import { AddSerieComponent } from '../add-serie/add-serie.component';

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    AddSerieComponent,
    NzModalModule,
    NzButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit {
  isModalVisible = false;
  isSubmitting = false;
  serieForm!: FormGroup;

  seriesList: any[] = [];
  columns = [
    { key: 'name', label: 'Nom de la série' },
    { key: 'code', label: 'Code' },
  ];
  constructor(private fb: FormBuilder,private seriesService: SeriesService) {}


  ngOnInit(): void {
    this.initForm();
    this.loadSeries();
  }

  private initForm(): void {
    this.serieForm = this.fb.group({
      code: ['', Validators.required],
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
    this.serieForm.patchValue(value);
  }

  submitForm(): void {
    if (this.serieForm.invalid) return;

    this.isSubmitting = true;
    this.seriesService.createSeries(this.serieForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.loadSeries();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  private loadSeries(): void {
    this.seriesService.getSeries().subscribe({
      next: (res) => {
        this.seriesList = res.data || [];
      },
      error: (err) => console.error(err)
    });
  }
}
