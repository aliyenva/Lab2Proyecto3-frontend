import { Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="notification-container" aria-live="polite">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          class="notification-toast"
          [ngClass]="'notification-' + notification.type"
          role="alert"
        >
          <span class="notification-icon">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
          <span class="notification-message">{{ notification.message }}</span>
          <button
            class="notification-close"
            (click)="notificationService.removeNotification(notification.id)"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .notification-toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(232, 213, 245, 0.3);
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
    }

    .notification-icon {
      font-size: 1.1rem;
      margin-right: 8px;
    }

    .notification-success {
      background: linear-gradient(135deg, #e8faf0 0%, #d4f5e5 100%);
      border: 2px solid #B5EAD7;
      color: #3a6b55;
    }

    .notification-error {
      background: linear-gradient(135deg, #FFF0F5 0%, #ffe8ed 100%);
      border: 2px solid #FFB7C5;
      color: #6b3a4a;
    }

    .notification-message {
      flex: 1;
      margin-right: 12px;
      font-size: 0.9rem;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      color: inherit;
      padding: 0 4px;
      line-height: 1;
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent {
  readonly notificationService = inject(NotificationService);
}
