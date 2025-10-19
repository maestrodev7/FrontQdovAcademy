import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, NzTableModule],
  templateUrl: './dynamic-table.component.html'
})
export class DynamicTableComponent {
  /**
   * Colonnes dynamiques
   * Exemple :
   * [
   *   { key: 'name', label: 'Nom' },
   *   { key: 'code', label: 'Code' },
   *   { key: 'description', label: 'Description' }
   * ]
   */
  @Input() columns: { key: string; label: string }[] = [];

  /**
   * Données du tableau
   * Exemple :
   * [{ name: 'Terminale', code: 'T', description: 'Dernière classe' }]
   */
  @Input() data: any[] = [];

  /**
   * Titre facultatif pour le tableau
   */
  @Input() title?: string;

  /**
   * Indique si on affiche les cases à cocher
   */
  @Input() selectable: boolean = false;

  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
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

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }
}
