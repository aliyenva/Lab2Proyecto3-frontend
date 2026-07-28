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
      <span class="nav-brand">🍙 Konbini</span>
      <a routerLink="/products" class="nav-link">🍱 Products</a>
      <a routerLink="/categories" class="nav-link">🏷️ Categories</a>
      <a *ngIf="authService.hasRole('SUPER-ADMIN-ROLE')" routerLink="/users" class="nav-link">👥 Users</a>
      <span class="nav-spacer"></span>
      <span class="nav-username">🌸 {{ authService.getUsername() }}</span>
      <button (click)="logout()" class="nav-logout-btn">Logout 👋</button>
    </nav>
  `,
  styles: [`
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.5rem;
      background: linear-gradient(135deg, #FFB7C5 0%, #E8D5F5 100%);
      color: #5a4a6b;
      box-shadow: 0 4px 15px rgba(255, 183, 197, 0.3);
      position: relative;
      z-index: 100;
    }

    .nav-brand {
      font-weight: 800;
      font-size: 1.2rem;
      margin-right: 1rem;
      color: #6b4a7a;
    }

    .nav-link {
      color: #5a4a6b;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.25s ease;
      background: rgba(255, 255, 255, 0.3);
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(255, 183, 197, 0.3);
    }

    .nav-spacer {
      flex: 1;
    }

    .nav-username {
      font-size: 0.9rem;
      font-weight: 600;
      color: #6b4a7a;
    }

    .nav-logout-btn {
      background: rgba(255, 255, 255, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.7);
      color: #6b4a7a;
      padding: 0.45rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: 'Nunito', sans-serif;
      transition: all 0.25s ease;
    }

    .nav-logout-btn:hover {
      background: rgba(255, 255, 255, 0.85);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(255, 183, 197, 0.3);
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
