import { Component, OnInit } from '@angular/core';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TableComponent } from './ui/table/table.component';
import { NzTableComponent } from "ng-zorro-antd/table";


@Component({
  selector: 'app-dashboad',
  templateUrl: './dashboad.component.html',
  styleUrls: ['./dashboad.component.css'],
  standalone: true,
  imports: [NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule,
    TableComponent],
})
export class DashboadComponent implements OnInit {

   isCollapsed = false;
  constructor() { }

  ngOnInit() {
  }

}
