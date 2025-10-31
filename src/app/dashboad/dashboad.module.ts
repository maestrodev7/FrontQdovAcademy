import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboadComponent } from './dashboad.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminsComponent } from '../users/admins/admins.component';
import { HomeComponent } from './components/home/home.component';
import { TeachersComponent } from '../users/teachers/teachers.component';
import { SeriesComponent } from '../classroom/series/series.component';
import { ClassroomComponent } from '../classroom/classroom/classroom.component';
import { ClassLevelComponent } from '../classroom/class-level/class-level.component';
import { ParentsComponent } from '../users/parents/parents.component';


const routes: Routes = [
  {
    path: '',
    component: DashboadComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'admins', component: AdminsComponent },
      { path: 'teachers', component: TeachersComponent},
      { path: 'parents', component: ParentsComponent },
      { path: 'series', component: SeriesComponent },
      { path: 'classrooms', component: ClassroomComponent },
      { path: 'class-levels', component: ClassLevelComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: []
})
export class DashboadModule {

 }
