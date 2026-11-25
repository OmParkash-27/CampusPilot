import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  signal,
  inject,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

type PracticeMode = 'digits' | 'uppercase' | 'lowercase' | 'symbols' | 'mix';

@Component({
  selector: 'app-typing-practice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ButtonModule
  ],
  templateUrl: './typing-practice.html',
  styleUrl: './typing-practice.scss',
})
export class TypingPracticeComponent implements OnDestroy {
  // ── Desktop detection ────────────────────────────────────────────────────────
  // The Typing Lab is designed for keyboard use and is only available on
  // desktop/laptop screens (>= 900 px wide).  This signal is checked in the
  // template to show either the full app or the restriction screen.
  // The @HostListener keeps the signal in sync when the browser is resized.
  isDesktop = signal<boolean>(window.innerWidth >= 900);

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isDesktop.set(window.innerWidth >= 900);
  }

  @ViewChild('typingInput')
  private typingInput?: ElementRef<HTMLInputElement>;

  // ── Router (for the "back to dashboard" button on the restriction screen) ───
  router = inject(Router);

  // ── Practice state (unchanged from original) ─────────────────────────────────
  practiceMode: PracticeMode = 'digits';
  characterSeconds = 2;
  sessionMinutes = 1;

  isRunning = false;
  currentCharacter: string | null = null;
  message = 'Choose your settings and start when you\u2019re ready.';
  messageType: 'normal' | 'success' | 'error' = 'normal';
  inputValue = '';
  inputDisabled = true;
  modeBadge = 'DIGITS';

  correct = 0;
  wrong = 0;
  remainingMs = 60_000;
  sessionDurationMs = 60_000;
  progress = 0;

  resultsVisible = false;
  resultSummary = '';
  resultAttempts = 0;
  resultCorrect = 0;
  resultWrong = 0;
  resultAccuracy = '0.0%';
  resultAverage = '0.00 sec';
  resultMostWrong = '\u2014';
  mostWrongDetail = '';

  private readonly cdr = inject(ChangeDetectorRef);

  private characterTimerId: ReturnType<typeof setTimeout> | null = null;
  private nextCharacterTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private sessionTimerId: ReturnType<typeof setInterval> | null = null;
  private currentCharacterStartedAt = 0;
  private currentCharacterDuration = 0;
  private sessionEndsAt = 0;
  private totalResponseTimeMs = 0;
  private completedResponseCount = 0;
  private incorrectByCharacter: Record<string, number> = {};
  
  private focusTypingInput(): void {
    setTimeout(() => {
      this.typingInput?.nativeElement.focus();
    });
  }

  // ── Settings options for PrimeNG select dropdowns ────────────────────────────
  readonly modeOptions = [
    { label: 'Digits (0\u20139)', value: 'digits' },
    { label: 'Uppercase letters (A\u2013Z)', value: 'uppercase' },
    { label: 'Lowercase letters (a\u2013z)', value: 'lowercase' },
    { label: 'Symbols', value: 'symbols' },
    { label: 'Mixed characters', value: 'mix' },
  ];

  readonly intervalOptions = [
    { label: '0.5 seconds', value: 0.5 },
    { label: '1 second', value: 1 },
    { label: '1.5 seconds', value: 1.5 },
    { label: '2 seconds', value: 2 },
    { label: '3 seconds', value: 3 },
    { label: '5 seconds', value: 5 },
  ];

  readonly durationOptions = [
    { label: '30 seconds', value: 0.5 },
    { label: '1 minute', value: 1 },
    { label: '2 minutes', value: 2 },
    { label: '3 minutes', value: 3 },
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
  ];

  private readonly characterSets: Record<PracticeMode, string[]> = {
    digits: Array.from('0123456789'),
    uppercase: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    lowercase: Array.from('abcdefghijklmnopqrstuvwxyz'),
    symbols: Array.from("!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~"),
    mix: Array.from(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~"
    ),
  };

  // ── Computed getters (unchanged) ─────────────────────────────────────────────
  get accuracy(): string {
    const attempts = this.correct + this.wrong;
    return attempts ? `${Math.round((this.correct / attempts) * 100)}%` : '\u2014';
  }

  get formattedRemainingTime(): string {
    const totalSeconds = Math.max(0, Math.ceil(this.remainingMs / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  get selectedModeLabel(): string {
    const labels: Record<PracticeMode, string> = {
      digits: 'Digits (0\u20139)',
      uppercase: 'Uppercase letters (A\u2013Z)',
      lowercase: 'Lowercase letters (a\u2013z)',
      symbols: 'Symbols',
      mix: 'Mixed characters',
    };
    return labels[this.practiceMode];
  }

  // ── Session control (unchanged) ──────────────────────────────────────────────
  startOrStopPractice(): void {
    if (this.isRunning) {
      this.finishSession();
      return;
    }
    this.startPractice();
  }

  startPractice(): void {
    this.clearTimers();
    this.resetStatistics();

    this.sessionDurationMs = this.sessionMinutes * 60_000;
    this.remainingMs = this.sessionDurationMs;
    this.sessionEndsAt = Date.now() + this.sessionDurationMs;
    this.progress = 0;
    this.isRunning = true;
    this.inputDisabled = false;
    this.resultsVisible = false;
    this.modeBadge = this.selectedModeLabel.toUpperCase();
    this.message = 'Type the character shown above.';
    this.messageType = 'normal';

    this.sessionTimerId = setInterval(() => this.updateSessionTime(), 100);
    this.updateSessionTime();
    this.generateCharacter();
    this.focusTypingInput();
  }
  
  onTypingInput(value: string): void {
    if (!this.isRunning || !this.currentCharacter || !value) {
      return;
    }
    const typedCharacter = Array.from(value)[0];
    if (this.characterTimerId === null) {
      return;
    }

    this.inputValue = '';

    const responseMs = Math.min(
      Date.now() - this.currentCharacterStartedAt,
      this.currentCharacterDuration
    );

    this.totalResponseTimeMs += responseMs;
    this.completedResponseCount++;

    this.clearCharacterTimer();

    if (typedCharacter === this.currentCharacter) {
      this.correct++;
      this.message = 'Correct — nice work!';
      this.messageType = 'success';
      this.scheduleNextCharacter(120);
    } else {
      this.recordWrongAttempt();
      this.message = 'Not quite — keep going.';
      this.messageType = 'error';
      this.scheduleNextCharacter(250);
    }
  }

  resetPractice(): void {
    this.isRunning = false;
    this.clearTimers();
    this.currentCharacter = null;
    this.inputDisabled = true;
    this.inputValue = '';
    this.modeBadge = this.practiceMode.toUpperCase();
    this.message = 'Choose your settings and start when you\u2019re ready.';
    this.messageType = 'normal';
    this.progress = 0;
    this.remainingMs = this.sessionMinutes * 60_000;
    this.resultsVisible = false;
    this.resetStatistics();
  }

  dismissResults(): void {
    this.resultsVisible = false;
  }

  // ── Desktop restriction navigation ───────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  // ── Private helpers (unchanged) ──────────────────────────────────────────────
  
private generateCharacter(): void {
  if (!this.isRunning || Date.now() >= this.sessionEndsAt) {
    if (this.isRunning) {
      this.finishSession();
    }
    return;
  }

  this.clearCharacterTimers();

  const characters = this.characterSets[this.practiceMode];

  this.currentCharacter =
    characters[Math.floor(Math.random() * characters.length)];

  this.inputValue = '';
  this.message = 'Type the character shown above.';
  this.messageType = 'normal';

  this.currentCharacterStartedAt = Date.now();
  this.currentCharacterDuration = this.characterSeconds * 1000;

  this.characterTimerId = setTimeout(
    () => this.handleCharacterTimeout(),
    this.currentCharacterDuration
  );

  // Important for Angular zoneless change detection.
  this.cdr.markForCheck();
}

private scheduleNextCharacter(delayMs: number): void {
  this.clearCharacterTimer();

  if (this.nextCharacterTimeoutId !== null) {
    clearTimeout(this.nextCharacterTimeoutId);
  }

  this.nextCharacterTimeoutId = setTimeout(() => {
    this.nextCharacterTimeoutId = null;

    if (this.isRunning) {
      this.generateCharacter();
    }
  }, delayMs);
}

  private clearCharacterTimer(): void {
    if (this.characterTimerId !== null) {
      clearTimeout(this.characterTimerId);
      this.characterTimerId = null;
    }
  }

  private handleCharacterTimeout(): void {
    this.characterTimerId = null;

    if (!this.isRunning) return;

    if (Date.now() >= this.sessionEndsAt) {
      this.finishSession();
      return;
    }

    this.recordWrongAttempt();

    this.totalResponseTimeMs += this.currentCharacterDuration;
    this.completedResponseCount++;

    this.message = 'Time is up for this character.';
    this.messageType = 'error';

    this.cdr.markForCheck();

    this.scheduleNextCharacter(250);
  }

  private recordWrongAttempt(): void {
    this.wrong++;
    if (this.currentCharacter) {
      this.incorrectByCharacter[this.currentCharacter] =
        (this.incorrectByCharacter[this.currentCharacter] || 0) + 1;
    }
  }
  private updateSessionTime(): void {
    const remaining = this.sessionEndsAt - Date.now();

    this.remainingMs = Math.max(0, remaining);

    this.progress = Math.min(
      100,
      Math.max(
        0,
        (1 - remaining / this.sessionDurationMs) * 100
      )
    );

    if (remaining <= 0 && this.isRunning) {
      this.finishSession();
      return;
    }

    this.cdr.markForCheck();
  }

  private finishSession(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.clearTimers();
    this.currentCharacter = null;
    this.inputDisabled = true;
    this.inputValue = '';
    this.remainingMs = 0;
    this.progress = 100;
    this.message = 'Session complete. Your results are ready below.';
    this.messageType = 'success';
    this.showResults();
    this.cdr.markForCheck();
  }

  private showResults(): void {
    const attempts = this.correct + this.wrong;
    const accuracy = attempts ? (this.correct / attempts) * 100 : 0;
    const averageSeconds = this.completedResponseCount
      ? this.totalResponseTimeMs / this.completedResponseCount / 1000
      : 0;
    const highestWrongCount = Math.max(
      0,
      ...Object.values(this.incorrectByCharacter)
    );
    const mostWrongCharacters = highestWrongCount
      ? Object.keys(this.incorrectByCharacter).filter(
          (c) => this.incorrectByCharacter[c] === highestWrongCount
        )
      : [];

    this.resultSummary = `${this.selectedModeLabel} \u00b7 ${this.formatDuration(this.sessionDurationMs)} session`;
    this.resultAttempts = attempts;
    this.resultCorrect = this.correct;
    this.resultWrong = this.wrong;
    this.resultAccuracy = `${accuracy.toFixed(1)}%`;
    this.resultAverage = `${averageSeconds.toFixed(2)} sec`;

    if (mostWrongCharacters.length) {
      this.resultMostWrong = mostWrongCharacters.join(', ');
      this.mostWrongDetail = `These character(s) were answered incorrectly or timed out ${highestWrongCount} time(s) each. Ties are all shown.`;
    } else {
      this.resultMostWrong = 'None';
      this.mostWrongDetail =
        'No incorrect answers or timeouts were recorded.';
    }

    this.resultsVisible = true;
  }

  private formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes
      ? `${minutes} min ${seconds ? `${seconds} sec` : ''}`.trim()
      : `${seconds} sec`;
  }

  private resetStatistics(): void {
    this.correct = 0;
    this.wrong = 0;
    this.totalResponseTimeMs = 0;
    this.completedResponseCount = 0;
    this.incorrectByCharacter = {};
  }

  private clearCharacterTimers(): void {
    this.clearCharacterTimer();
    if (this.nextCharacterTimeoutId) {
      clearTimeout(this.nextCharacterTimeoutId);
      this.nextCharacterTimeoutId = null;
    }
  }

  private clearTimers(): void {
    this.clearCharacterTimers();
    if (this.sessionTimerId) {
      clearInterval(this.sessionTimerId);
      this.sessionTimerId = null;
    }
  }
}
