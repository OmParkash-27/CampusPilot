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
}
