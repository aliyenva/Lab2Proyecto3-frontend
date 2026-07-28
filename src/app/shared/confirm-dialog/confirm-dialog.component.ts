import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-dialog-overlay" *ngIf="visible" (click)="onCancel()">
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
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
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-dialog {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .confirm-dialog-message {
      margin: 0 0 20px;
      font-size: 16px;
      color: #333;
    }

    .confirm-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-cancel {
      background: #e0e0e0;
      color: #333;
    }

    .btn-cancel:hover {
      background: #d0d0d0;
    }

    .btn-confirm {
      background: #dc3545;
      color: #fff;
    }

    .btn-confirm:hover {
      background: #c82333;
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
