import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-about',
  imports: [CommonModule, CardModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

}
