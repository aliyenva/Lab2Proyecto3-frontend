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
        <div class="login-header">
          <span class="header-emoji">🌸</span>
          <h2>Welcome Back!</h2>
          <p class="subtitle">Sign in to your konbini</p>
        </div>

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
            <div class="password-wrapper">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                [formControl]="password"
                [maxLength]="100"
                placeholder="Enter password"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          @if (errorMessage) {
            <div class="error-message" role="alert">
              {{ errorMessage }}
            </div>
          }

          <button
            type="button"
            (click)="onSubmit()"
            [disabled]="isSubmitDisabled()"
            class="submit-btn"
          >
            @if (loading) {
              <span class="spinner" aria-hidden="true"></span>
              Logging in...
            } @else {
              Login 🍙
            }
          </button>
        </form>

        <p class="register-link">
          Don't have an account? <a routerLink="/register">Register here ✨</a>
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
      position: relative;
      z-index: 1;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 183, 197, 0.3);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(255, 183, 197, 0.2), 0 2px 8px rgba(232, 213, 245, 0.15);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-emoji {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    h2 {
      text-align: center;
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: #6b4a7a;
    }

    .subtitle {
      color: #9b8aa8;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      color: #6b4a7a;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.7rem 1rem;
      border: 2px solid #E8D5F5;
      border-radius: 12px;
      font-size: 1rem;
      font-family: 'Nunito', sans-serif;
      box-sizing: border-box;
      background: #FFFEF2;
      color: #5a4a6b;
      transition: all 0.25s ease;
    }

    input:focus {
      outline: none;
      border-color: #FFB7C5;
      box-shadow: 0 0 0 3px rgba(255, 183, 197, 0.2);
      background: #fff;
    }

    input::placeholder {
      color: #c4b5d0;
    }

    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-wrapper input {
      padding-right: 2.5rem;
    }

    .toggle-password {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0;
      line-height: 1;
    }

    .error-message {
      color: #d4708a;
      background-color: #FFF0F5;
      border: 1px solid #FFB7C5;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .submit-btn {
      width: 100%;
      padding: 0.8rem;
      background: linear-gradient(135deg, #FFB7C5 0%, #FF8FA3 100%);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(255, 143, 163, 0.3);
      transition: all 0.25s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 143, 163, 0.4);
    }

    .submit-btn:disabled {
      background: linear-gradient(135deg, #E8D5F5 0%, #d4c4e3 100%);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
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
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #9b8aa8;
    }

    .register-link a {
      color: #e88ca5;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      color: #d4708a;
    }
  `]
})
export class LoginComponent {
  username = new FormControl('', [Validators.maxLength(50)]);
  password = new FormControl('', [Validators.maxLength(100)]);
  loading = false;
  errorMessage = '';
  showPassword = false;

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
    console.log('onSubmit called');
    if (this.isSubmitDisabled()) {
      console.log('Submit is disabled, returning');
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
