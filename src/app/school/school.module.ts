import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolComponent } from './school.component';
import { RouterModule, Routes } from '@angular/router';
import { AddSchoolComponent } from './components/add-school/add-school.component';

const routes: Routes = [
  { path: 'list', component: SchoolComponent },
  { path: 'school/:id', component: SchoolComponent },
  { path: 'school/:id/edit', component: SchoolComponent },
  { path: 'add', component: AddSchoolComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
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
