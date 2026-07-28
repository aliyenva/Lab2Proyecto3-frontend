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
        <h1>Register</h1>

        <div class="success-message" *ngIf="successMessage">
          {{ successMessage }}
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
            <span *ngIf="!loading">Register</span>
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Login here</a>
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
      background-color: #f5f5f5;
    }

    .register-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      margin: 0 0 1.5rem 0;
      text-align: center;
      color: #333;
    }

    .form-field {
      margin-bottom: 1rem;
    }

    .form-field label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
      color: #555;
    }

    .form-field input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-field input:focus {
      outline: none;
      border-color: #4a90d9;
      box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
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
      margin-top: 0.5rem;
      transition: background-color 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #357abd;
    }

    .submit-btn:disabled {
      background-color: #a0c4e8;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #fdecea;
      color: #b71c1c;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .loading-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .login-link {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #666;
    }

    .login-link a {
      color: #4a90d9;
      text-decoration: none;
    }

    .login-link a:hover {
      text-decoration: underline;
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
