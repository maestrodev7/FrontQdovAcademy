import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SchoolService } from '../../school/services/school.service';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-add-parent',
  templateUrl: './add-parent.component.html',
  styleUrls: ['./add-parent.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      NzGridModule,
      NzFormModule,
      NzInputModule,
      NzDividerModule,
      NzButtonModule,
    ],
})
export class AddParentComponent implements OnInit {

  @Input() form!: FormGroup;
  @Output() formChange = new EventEmitter<any>();

  schools: any[] = [];
  isLoading = false;

  constructor(private schoolService: SchoolService) {}

  ngOnInit(): void {
  }

  onSubmit() {
    this.formChange.emit(this.form.value);
  }
}
