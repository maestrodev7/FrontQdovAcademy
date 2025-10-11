import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SchoolService } from '../../school/services/school.service';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzGridModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDividerModule,
    NzButtonModule,
  ],
})
export class AddAdminComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() formChange = new EventEmitter<any>();

  schools: any[] = [];
  isLoading = false;

  constructor(private schoolService: SchoolService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.schoolService.getSchools().subscribe({
      next: (res) => {
        this.schools = res.data || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onSubmit() {
    this.formChange.emit(this.form.value);
  }
}
