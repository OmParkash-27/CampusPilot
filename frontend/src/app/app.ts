import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading/loading-service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProgressSpinnerModule, CommonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: []
})
export class App {
  protected readonly title = signal('CampusPilot');
  constructor(public loadingService: LoadingService) {}
}
