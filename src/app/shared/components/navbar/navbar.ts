import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand" routerLink="/">
          <span class="brand-icon">🎯</span>
          <span class="brand-text">QuizMaster</span>
        </div>

        <div class="nav-menu">
          <a routerLink="/quizzes" routerLinkActive="active" class="nav-link">
            Quizzes
          </a>
          
          <a *ngIf="isAdmin" routerLink="/admin/quiz/create" routerLinkActive="active" class="nav-link">
            Create Quiz
          </a>

          <a *ngIf="isAuthenticated" routerLink="/profile/attempts" routerLinkActive="active" class="nav-link">
            My Attempts
          </a>

          <div *ngIf="!isAuthenticated" class="auth-buttons">
            <a routerLink="/auth/login" class="btn btn-outline">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary">Register</a>
          </div>

          <div *ngIf="isAuthenticated" class="user-menu">
            <button class="user-button" (click)="toggleDropdown()">
              <span class="user-icon">👤</span>
              <span class="username">{{ username }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <div class="dropdown-menu" *ngIf="showDropdown">
              <a routerLink="/profile/attempts" class="dropdown-item" (click)="closeDropdown()">
                📊 My Attempts
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout" (click)="logout()">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .brand-icon {
      font-size: 32px;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-link {
      color: #666;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.3s;
    }

    .nav-link:hover {
      color: #667eea;
      background: #f8f9ff;
    }

    .nav-link.active {
      color: #667eea;
      background: #f8f9ff;
    }

    .auth-buttons {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
      display: inline-block;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-outline {
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .user-menu {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f8f9ff;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .user-button:hover {
      border-color: #667eea;
    }

    .user-icon {
      font-size: 20px;
    }

    .username {
      font-weight: 600;
      color: #333;
    }

    .dropdown-arrow {
      font-size: 10px;
      color: #666;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      overflow: hidden;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      display: block;
      padding: 12px 20px;
      color: #333;
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      transition: background 0.2s;
    }

    .dropdown-item:hover {
      background: #f8f9ff;
    }

    .dropdown-item.logout {
      color: #f44336;
    }

    .dropdown-item.logout:hover {
      background: #ffebee;
    }

    .dropdown-divider {
      height: 1px;
      background: #e0e0e0;
    }

    @media (max-width: 768px) {
      .nav-menu {
        gap: 10px;
      }

      .nav-link {
        padding: 6px 12px;
        font-size: 14px;
      }

      .brand-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);

  isAuthenticated = false;
  isAdmin = false;
  username = '';
  showDropdown = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(username => {
      this.username = username || '';
      this.isAuthenticated = !!username;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdown();
  }
}