import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-recent-list',
  imports: [CommonModule, TableModule],
  templateUrl: './recent-list.html',
  styleUrl: './recent-list.scss',
  standalone: true
})
export class RecentList {
  @Input() title!: string;
  @Input() data: any[] = [];
  @Input() columns: { field: string; header: string }[] = [];

  getValue(row: any, field: string): any {
  try {
    return field.split('.').reduce((acc, part) => {
      // Handle array index like courses[0]
      const match = part.match(/(\w+)\[(\d+)\]/);
      if (match) {
        const key = match[1];      // e.g., "courses"
        const index = +match[2];   // e.g., 0
        return acc?.[key]?.[index];
      }
      return acc?.[part];
    }, row);
  } catch {
    return null;
  }
}

}

