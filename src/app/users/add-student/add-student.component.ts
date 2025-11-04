import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SchoolService } from '../../school/services/school.service';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css'],
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
export class AddStudentComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() formChange = new EventEmitter<any>();

  schoolName: string | null = null;
  parents:  any[] = [];
  isLoading = false;
  constructor(
    private schoolService: SchoolService,
    private userService: UsersService
  ) {}

  ngOnInit() {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) return;

    this.isLoading = true;
    this.schoolService.getSchools().subscribe({
      next: (res) => {
        const school = (res.data || []).find((s: any) => s.id === schoolId);
        if (school) {
          this.schoolName = school.name;
          this.form.patchValue({ schoolId: school.id });
        }
      },
      error: () => console.error('Erreur de chargement de l\'école'),
    });

    this.isLoading = true;
    this.userService.getParents().subscribe({
      next: (res) => {
        this.parents = (res.data?.content ?? []).map((parent: any) => ({
          id: parent.id,
          fullName: `${parent.firstName} ${parent.lastName}`,
          email: parent.email,
          phoneNumber: parent.phoneNumber,
          role: parent.roles?.join(', ') || 'PARENT',
        }));

        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });


  }
  filterParentOption = (input: string, option: any): boolean => {
    return option.nzLabel.toLowerCase().indexOf(input.toLowerCase()) > -1;
  };
  onSubmit() {
  this.formChange.emit(this.form.value);
  }
}
