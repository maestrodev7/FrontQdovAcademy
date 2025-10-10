import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../dashboad/ui/table/table.component';

import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.css'],
  standalone: true,
  imports: [
    TableComponent,NzButtonModule
  ],
})
export class AdminsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
