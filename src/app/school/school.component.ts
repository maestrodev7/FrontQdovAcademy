import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { Router } from '@angular/router';

import { SchoolService } from './services/school.service';
import { ApiResponse } from '../shared/interfaces/api-response';
import { School } from './interfaces/school';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {  NzFlexModule } from 'ng-zorro-antd/flex';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css'],
  standalone: true,
  imports: [
    NzCardModule,
    NzSpinModule,
    NzListModule,
    NzIconModule,
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzFlexModule,
    NzSegmentedModule,
  ],
})
export class SchoolComponent implements OnInit {
  schools: School[] = [];
  loading = true;
  userRole: string = '';

  constructor(
    private schoolService: SchoolService,
    private message: NzMessageService,
    private router: Router
  ) {}

ngOnInit(): void {

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = Array.isArray(user?.roles) ? user.roles[0] : user?.role;
  this.userRole = role || '';

  if (role === 'SUPER_ADMIN') {
    this.loadSchools();
  } else {
    const schools = JSON.parse(localStorage.getItem('userSchools') || '[]');
    if (schools.length > 0) {
      this.schools = schools;
      this.loading = false;
    } else {
      this.message.info("Aucune école associée à cet utilisateur");
      this.loading = false;
    }
  }
}

isSuperAdmin(): boolean {
  return this.userRole === 'SUPER_ADMIN' || (typeof this.userRole === 'string' && this.userRole.includes('SUPER_ADMIN'));
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


  goToAddSchool() {
    this.router.navigate(['/school/add']);
  }

  selectSchool(school: School) {
    localStorage.setItem("schoolId", school.id);
    this.message.success(`École sélectionnée : ${school.name}`);
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 500);
  }
}
