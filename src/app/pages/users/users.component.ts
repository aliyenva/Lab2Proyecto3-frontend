import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-page">
      <div class="page-header">
        <h2>👥 Usuarios</h2>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="loading-indicator">
        <span class="spinner"></span> Loading users...
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !errorMessage && users.length === 0" class="empty-state">
        <span class="empty-emoji">👥</span>
        <p>No users are registered yet!</p>
        <p class="empty-sub">Users will appear here when they register ✨</p>
      </div>

      <!-- Users table -->
      <div *ngIf="!loading && !errorMessage && users.length > 0" class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.username }}</td>
              <td><span class="role-badge">{{ user.role }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-page {
      padding: 2rem;
      position: relative;
      z-index: 1;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    h2 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: #6b4a7a;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 2rem;
      color: #9b8aa8;
      font-weight: 500;
      justify-content: center;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #E8D5F5;
      border-top-color: #FFB7C5;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      background: #FFF0F5;
      border: 1px solid #FFB7C5;
      color: #d4708a;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #9b8aa8;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 16px;
      border: 2px dashed #E8D5F5;
    }

    .empty-emoji {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .empty-state p {
      margin: 0.25rem 0;
      font-weight: 600;
    }

    .empty-sub {
      font-size: 0.9rem;
      font-weight: 400 !important;
      color: #b8a5c8;
    }

    .table-wrapper {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(232, 213, 245, 0.2);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(255, 255, 255, 0.95);
    }

    .users-table th {
      background: linear-gradient(135deg, #FFDAC1 0%, #FFE8D0 100%);
      padding: 14px 16px;
      text-align: left;
      font-weight: 700;
      color: #6b5a4a;
      border-bottom: 2px solid #FFD0B0;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .users-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f5eef8;
      color: #5a4a6b;
    }

    .users-table tbody tr:nth-child(even) {
      background: rgba(232, 213, 245, 0.1);
    }

    .users-table tbody tr:nth-child(odd) {
      background: rgba(255, 245, 186, 0.1);
    }

    .users-table tbody tr:hover {
      background: rgba(255, 183, 197, 0.1);
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, #E8D5F5 0%, #d4bfe8 100%);
      color: #5a4a6b;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: UserResponse[] = [];
  loading = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        // 401 errors are handled by the JWT interceptor (redirects to login)
        if (error.status !== 401) {
          this.errorMessage = 'Could not load users';
        }
        this.loading = false;
      }
    });
  }
}
