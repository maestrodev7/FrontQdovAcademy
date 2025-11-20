import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-add-classroom',
  standalone: true,
  templateUrl: './add-classroom.component.html',
  styleUrls: ['./add-classroom.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzGridModule,
  ],
})
export class AddClassroomComponent implements OnInit {

  @Input() form!: FormGroup;
  @Input() levels: any[] = [];
  @Input() series: any[] = [];

  @Output() formChange = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.formChange.emit(this.form.value);
  }
}
