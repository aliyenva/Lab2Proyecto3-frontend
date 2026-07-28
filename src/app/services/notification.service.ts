import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  readonly notifications = signal<Notification[]>([]);

  showSuccess(message: string): void {
    this.addNotification(message, 'success');
  }

  showError(message: string): void {
    this.addNotification(message, 'error');
  }

  private addNotification(message: string, type: 'success' | 'error'): void {
    const id = this.nextId++;
    const notification: Notification = { id, message, type };
    this.notifications.update(current => [...current, notification]);

    setTimeout(() => {
      this.removeNotification(id);
    }, 3000);
  }

  removeNotification(id: number): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }
}
