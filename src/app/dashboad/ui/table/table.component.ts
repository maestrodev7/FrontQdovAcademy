import { Component, OnInit } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UsersService } from '../../../users/services/users.service';
import { CommonModule } from '@angular/common';

interface SchoolAdmin {
  id: string;
  role: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    roles: string[];
  };
  school: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
    email: string | null;
  };
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NzTableModule,CommonModule],
  templateUrl: './table.component.html'
})
export class TableComponent implements OnInit {
  listOfData: SchoolAdmin[] = [];
  listOfCurrentPageData: readonly SchoolAdmin[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  listOfSelection = [
    { text: 'Select All Row', onSelect: () => this.onAllChecked(true) },
    { text: 'Select Odd Row', onSelect: () => this.selectOddRows() },
    { text: 'Select Even Row', onSelect: () => this.selectEvenRows() }
  ];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadSchoolsWithAdmins();
  }

  loadSchoolsWithAdmins(): void {
    this.usersService.getSchoolsWithAdmins().subscribe(res => {
      this.listOfData = res.data;
    });
  }

  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) this.setOfCheckedId.add(id);
    else this.setOfCheckedId.delete(id);
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly SchoolAdmin[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  selectOddRows(): void {
    this.listOfCurrentPageData.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 !== 0));
    this.refreshCheckedStatus();
  }

  selectEvenRows(): void {
    this.listOfCurrentPageData.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 === 0));
    this.refreshCheckedStatus();
  }
}
