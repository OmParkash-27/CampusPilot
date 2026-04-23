import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogActionService } from '../../services/dialog-action-service';

export interface DialogButton {
  label: string;
  icon?: string;
  styleClass?: string;
  action?: (ref: DynamicDialogRef) => void;
}
@Component({
  selector: 'app-dialog-footer',
  imports: [CommonModule, ButtonModule],
  templateUrl: './dialog-footer.html',
  styleUrl: './dialog-footer.scss',
  standalone: true
})
export class DialogFooter {
  buttons: DialogButton[] = [];

  constructor(
    public ref: DynamicDialogRef, config: DynamicDialogConfig, private actionService: DialogActionService
  ) {
    this.buttons = config.data?.footer?.buttons || [];
  }

  handleClick(btn: any) {
    if (btn.type === 'submit') {
      this.actionService.triggerSubmit(); 
    } else {
      btn.action?.(this.ref);
    }
  }
}
