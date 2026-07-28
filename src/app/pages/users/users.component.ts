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
      <h2>Users</h2>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="loading-indicator">
        <span class="spinner"></span> Loading users...
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !errorMessage && users.length === 0" class="info-message">
        No users are registered
      </div>

      <!-- Users table -->
      <table *ngIf="!loading && !errorMessage && users.length > 0" class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .users-page {
      padding: 24px;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      color: #666;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #e0e0e0;
      border-top-color: #1976d2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      padding: 12px 16px;
      background-color: #fdecea;
      color: #b71c1c;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .info-message {
      padding: 12px 16px;
      background-color: #e3f2fd;
      color: #1565c0;
      border: 1px solid #90caf9;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    .users-table th,
    .users-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .users-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .users-table tbody tr:hover {
      background-color: #fafafa;
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
