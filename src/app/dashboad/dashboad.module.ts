import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboadComponent } from './dashboad.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminsComponent } from '../users/admins/admins.component';
import { HomeComponent } from './components/home/home.component';
import { TeachersComponent } from '../users/teachers/teachers.component';


const routes: Routes = [
  {
    path: '',
    component: DashboadComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'admins', component: AdminsComponent },
      { path: 'teachers', component: TeachersComponent},
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
