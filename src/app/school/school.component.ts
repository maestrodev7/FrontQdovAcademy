import { ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
interface School {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule,NzCardModule,NzSpinModule,NzListModule,NzIconModule,CommonModule,NzGridModule],
})
export class SchoolComponent implements OnInit {
  schools: School[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8080/api/schools').subscribe({
      next: (res) => {
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
