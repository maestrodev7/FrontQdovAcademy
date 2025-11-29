import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboadComponent } from './dashboad.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminsComponent } from '../users/admins/admins.component';
import { PromoteursComponent } from '../users/promoteurs/promoteurs.component';
import { HomeComponent } from './components/home/home.component';
import { TeachersComponent } from '../users/teachers/teachers.component';
import { SeriesComponent } from '../classroom/series/series.component';
import { ClassroomComponent } from '../classroom/classroom/classroom.component';
import { ClassLevelComponent } from '../classroom/class-level/class-level.component';
import { ParentsComponent } from '../users/parents/parents.component';
import { StudentsComponent } from '../users/students/students.component';
import { RegistrationsComponent } from '../registrations/registrations.component';
import { SchoolParametersComponent } from '../school/components/school-parameters/school-parameters.component';
import { SubjectsComponent } from '../subjects/subjects.component';
import { ClassroomSubjectsComponent } from '../subjects/components/classroom-subjects/classroom-subjects.component';
import { TeacherSubjectsComponent } from '../subjects/components/teacher-subjects/teacher-subjects.component';
import { SchedulesComponent } from '../subjects/components/schedules/schedules.component';


const routes: Routes = [
  {
    path: '',
    component: DashboadComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'admins', component: AdminsComponent },
      { path: 'promoteurs', component: PromoteursComponent },
      { path: 'teachers', component: TeachersComponent},
      { path: 'parents', component: ParentsComponent },
      { path: 'students', component: StudentsComponent},
      { path: 'series', component: SeriesComponent },
      { path: 'classrooms', component: ClassroomComponent },
      { path: 'class-levels', component: ClassLevelComponent },
      { path: 'registrations', component: RegistrationsComponent },
      { path: 'parameters', component: SchoolParametersComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'classroom-subjects', component: ClassroomSubjectsComponent },
      { path: 'teacher-subjects', component: TeacherSubjectsComponent },
      { path: 'schedules', component: SchedulesComponent },
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
