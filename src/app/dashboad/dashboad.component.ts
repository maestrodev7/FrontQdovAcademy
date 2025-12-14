import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboad',
  templateUrl: './dashboad.component.html',
  styleUrls: ['./dashboad.component.css'],
  standalone: true,
  imports: [
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzLayoutModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
})
export class DashboadComponent implements OnInit {
  protected readonly date = new Date();
  isCollapsed = false;
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Gérer différents formats de rôles
    if (Array.isArray(user.roles)) {
      this.userRole = user.roles[0] || user.roles.join(',');
    } else if (typeof user.roles === 'string') {
      this.userRole = user.roles;
    } else if (user.role) {
      this.userRole = user.role;
    } else {
      this.userRole = '';
    }
    
    console.log('User Role:', this.userRole);
  }


  isSuperAdmin(): boolean {
    return this.userRole.includes('SUPER_ADMIN');
  }

  isAdminOrPromoteur(): boolean {
    return (
      this.userRole.includes('ADMIN') ||
      this.userRole .includes('PROMOTEUR')
    );
  }

  isTeacher(): boolean {
    return this.userRole.includes('ENSEIGNANT') || this.userRole.includes('TEACHER');
  }
}
