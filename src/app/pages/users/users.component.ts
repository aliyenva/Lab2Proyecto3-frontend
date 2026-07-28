import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">👥 Usuarios</h2>
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
        <table class="data-table">
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
