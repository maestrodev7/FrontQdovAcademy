import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-add-class-level',
  standalone: true,
  templateUrl: './add-class-level.component.html',
  styleUrls: ['./add-class-level.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzGridModule,
    NzButtonModule,
  ],
})
export class AddClassLevelComponent implements OnInit {

  @Input() form!: FormGroup;
  @Output() formChange = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.formChange.emit(this.form.value);
  }
}
