import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav *ngIf="authService.isAuthenticated()" class="nav-menu">
      <a routerLink="/products" class="nav-link">Products</a>
      <a routerLink="/categories" class="nav-link">Categories</a>
      <a *ngIf="authService.hasRole('SUPER-ADMIN-ROLE')" routerLink="/users" class="nav-link">Users</a>
      <span class="nav-spacer"></span>
      <span class="nav-username">{{ authService.getUsername() }}</span>
      <button (click)="logout()" class="nav-logout-btn">Logout</button>
    </nav>
  `,
  styles: [`
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      background-color: #1976d2;
      color: white;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .nav-spacer {
      flex: 1;
    }

    .nav-username {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .nav-logout-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.7);
      color: white;
      padding: 0.4rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .nav-logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  `]
})
export class NavMenuComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
