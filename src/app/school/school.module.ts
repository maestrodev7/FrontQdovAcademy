import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolComponent } from './school.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'school', component: SchoolComponent },
  { path: '', redirectTo: 'school', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
  ]
})
export class SchoolModule { }
