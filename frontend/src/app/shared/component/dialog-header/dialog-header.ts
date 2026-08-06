import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Times } from '@primeicons/angular/times';

@Component({
  selector: 'app-dialog-header',
  imports: [ChipModule, ButtonModule, Times],
  templateUrl: './dialog-header.html',
  styleUrl: './dialog-header.scss',
  standalone: true
})
export class DialogHeader {
  title!: string;
  icon!: string;
  user: any;

  constructor(public ref: DynamicDialogRef, config: DynamicDialogConfig) {
    this.title = config.data?.header?.title;
    this.icon = config.data?.header?.icon;
    this.user = config.data?.header?.user;
  }
}
