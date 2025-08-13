import { Component, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule, CardModule],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss',
  standalone: true
})
export class StatsCard {
  @Input() title!: string;
  @Input() value!: number | string;
  @Input() icon!: string;
  @Input() color!: string; // e.g. 'linear-gradient(...)'
}
