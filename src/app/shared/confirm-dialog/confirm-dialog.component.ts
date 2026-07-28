import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-dialog-overlay" *ngIf="visible" (click)="onCancel()">
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
        <div class="confirm-icon">🗑️</div>
        <p class="confirm-dialog-message">
          Are you sure you want to delete <strong>{{ entityName }}</strong>?
        </p>
        <div class="confirm-dialog-actions">
          <button class="btn btn-cancel" (click)="onCancel()">Cancel</button>
          <button class="btn btn-confirm" (click)="onConfirm()">Confirm</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(107, 74, 122, 0.3);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-dialog {
      background: rgba(255, 255, 255, 0.97);
      border-radius: 20px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(255, 183, 197, 0.25), 0 2px 8px rgba(232, 213, 245, 0.15);
      border: 2px solid rgba(255, 183, 197, 0.3);
      text-align: center;
    }

    .confirm-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .confirm-dialog-message {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      color: #5a4a6b;
      font-weight: 500;
    }

    .confirm-dialog-message strong {
      color: #6b4a7a;
    }

    .confirm-dialog-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .btn {
      padding: 0.6rem 1.5rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Nunito', sans-serif;
      transition: all 0.25s ease;
    }

    .btn-cancel {
      background: rgba(232, 213, 245, 0.4);
      color: #6b4a7a;
      border: 2px solid #E8D5F5;
    }

    .btn-cancel:hover {
      background: rgba(232, 213, 245, 0.6);
    }

    .btn-confirm {
      background: linear-gradient(135deg, #FFB7C5 0%, #ff9aad 100%);
      color: #6b3a4a;
      box-shadow: 0 3px 10px rgba(255, 183, 197, 0.3);
    }

    .btn-confirm:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(255, 183, 197, 0.4);
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() entityName: string = '';
  @Input() visible: boolean = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
