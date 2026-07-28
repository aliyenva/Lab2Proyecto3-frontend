import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <span class="header-emoji">✨</span>
          <h1>Join Us!</h1>
          <p class="subtitle">Create your konbini account</p>
        </div>

        <div class="success-message" *ngIf="successMessage">
          ✅ {{ successMessage }}
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>

          <div class="form-field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter password"
              autocomplete="new-password"
            />
          </div>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="isSubmitDisabled()"
          >
            <span *ngIf="loading" class="loading-indicator">Registering...</span>
            <span *ngIf="!loading">Register 🌟</span>
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Login here 🌸</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      position: relative;
      z-index: 1;
    }

    .register-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(232, 213, 245, 0.4);
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 8px 32px rgba(232, 213, 245, 0.25), 0 2px 8px rgba(255, 183, 197, 0.15);
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-emoji {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    h1 {
      margin: 0;
      text-align: center;
      color: #6b4a7a;
      font-weight: 800;
      font-size: 1.6rem;
    }

    .subtitle {
      color: #9b8aa8;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .form-field {
      margin-bottom: 1.25rem;
    }

    .form-field label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      color: #6b4a7a;
      font-size: 0.9rem;
    }

    .form-field input {
      width: 100%;
      padding: 0.7rem 1rem;
      border: 2px solid #E8D5F5;
      border-radius: 12px;
      font-size: 1rem;
      font-family: 'Nunito', sans-serif;
      transition: all 0.25s ease;
      background: #FFFEF2;
      color: #5a4a6b;
      box-sizing: border-box;
    }

    .form-field input:focus {
      outline: none;
      border-color: #FFB7C5;
      box-shadow: 0 0 0 3px rgba(255, 183, 197, 0.2);
      background: #fff;
    }

    .form-field input::placeholder {
      color: #c4b5d0;
    }

    .submit-btn {
      width: 100%;
      padding: 0.8rem;
      background: linear-gradient(135deg, #E8D5F5 0%, #FFB7C5 100%);
      color: #5a4a6b;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: all 0.25s ease;
      box-shadow: 0 4px 15px rgba(232, 213, 245, 0.3);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(232, 213, 245, 0.4);
    }

    .submit-btn:disabled {
      background: linear-gradient(135deg, #e8e0f0 0%, #f0e0e8 100%);
      cursor: not-allowed;
      box-shadow: none;
      color: #b0a0b8;
    }

    .error-message {
      background-color: #FFF0F5;
      color: #d4708a;
      border: 1px solid #FFB7C5;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .success-message {
      background-color: #e8faf0;
      color: #4a8a6a;
      border: 1px solid #B5EAD7;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .loading-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .login-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #9b8aa8;
    }

    .login-link a {
      color: #e88ca5;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link a:hover {
      color: #d4708a;
    }
  `]
})
export class RegisterComponent {
  registerForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isSubmitDisabled(): boolean {
    const username = this.registerForm.get('username')?.value || '';
    const password = this.registerForm.get('password')?.value || '';
    return username.trim().length === 0 || password.trim().length === 0 || this.loading;
  }

  onSubmit(): void {
    if (this.isSubmitDisabled()) {
      return;
    }

    const username = this.registerForm.get('username')!.value!.trim();
    const password = this.registerForm.get('password')!.value!;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.loading = false;
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 409) {
          this.errorMessage = 'Username already exists';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
