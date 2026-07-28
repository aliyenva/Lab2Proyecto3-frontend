import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              [formControl]="username"
              [maxLength]="50"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [formControl]="password"
              [maxLength]="100"
              placeholder="Enter password"
              autocomplete="current-password"
            />
          </div>

          @if (errorMessage) {
            <div class="error-message" role="alert">
              {{ errorMessage }}
            </div>
          }

          <button
            type="submit"
            [disabled]="isSubmitDisabled()"
            class="submit-btn"
          >
            @if (loading) {
              <span class="spinner" aria-hidden="true"></span>
              Logging in...
            } @else {
              Login
            }
          </button>
        </form>

        <p class="register-link">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #4a90d9;
      box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
    }

    .error-message {
      color: #d32f2f;
      background-color: #fdecea;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background-color: #4a90d9;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #357abd;
    }

    .submit-btn:disabled {
      background-color: #a0c4e8;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .register-link {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    .register-link a {
      color: #4a90d9;
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username = new FormControl('', [Validators.maxLength(50)]);
  password = new FormControl('', [Validators.maxLength(100)]);
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isSubmitDisabled(): boolean {
    const usernameValue = this.username.value?.trim() || '';
    const passwordValue = this.password.value?.trim() || '';
    return usernameValue.length === 0 || passwordValue.length === 0 || this.loading;
  }

  onSubmit(): void {
    if (this.isSubmitDisabled()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const usernameValue = this.username.value!.trim();
    const passwordValue = this.password.value!.trim();

    this.authService.login(usernameValue, passwordValue).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid credentials. Please try again.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }
}
