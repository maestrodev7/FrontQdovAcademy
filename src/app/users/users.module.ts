import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminsComponent } from './admins/admins.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { TeachersComponent } from './teachers/teachers.component';

const routes: Routes = [
  { path: 'list', component: UsersComponent },
  { path: 'admins', component: AdminsComponent },
  { path: 'teachers', component: TeachersComponent},
  { path: 'add-admin',component: AddAdminComponent},
  { path: '', redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: []
})
export class UsersModule { }
