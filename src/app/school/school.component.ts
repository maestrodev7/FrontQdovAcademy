import { ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SchoolService } from './services/school.service';
import { ApiResponse } from '../shared/interfaces/api-response';
import { School } from './interfaces/school';

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzSpinModule,
    NzListModule,
    NzIconModule,
    CommonModule,
    NzGridModule
  ],
})
export class SchoolComponent implements OnInit {
  schools: School[] = [];
  loading = true;

  constructor(
    private schoolService: SchoolService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools() {
    this.schoolService.getSchools().subscribe({
  next: (res: ApiResponse<School[]>) => {
    this.schools = res.data;
    this.loading = false;
  },
  error: () => {
    this.message.error("Impossible de charger les écoles");
    this.loading = false;
  }
});

  }

  selectSchool(school: School) {
    localStorage.setItem("schoolId", school.id);
    this.message.success(`École sélectionnée : ${school.name}`);
  }
}
