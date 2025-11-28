import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';

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
          <!-- Quizzes link ONLY shows when NOT authenticated -->
          <a *ngIf="!isAuthenticated" routerLink="/quizzes/names" routerLinkActive="active" class="nav-link">
            Quizzes
          </a>
          
          <!-- ADMIN MENU: Show when user is admin -->
          <div *ngIf="isAdmin" class="admin-menu">
            <button class="admin-button" (click)="toggleAdminMenu()">
              <span class="admin-icon">⚙️</span>
              <span class="admin-text">Manage Quizzes</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <div class="admin-dropdown" *ngIf="showAdminMenu">
              <a routerLink="/admin/quiz/create" class="dropdown-item" (click)="closeAdminMenu()">
                ➕ Create New Quiz
              </a>
              <a routerLink="/quizzes" class="dropdown-item" (click)="closeAdminMenu()">
                ✏️ Edit Existing Quiz
              </a>
              <div class="dropdown-divider"></div>
              <a routerLink="/profile/attempts" class="dropdown-item" (click)="closeAdminMenu()">
                📊 My Attempts
              </a>
            </div>
          </div>

          <!-- Regular user menu (non-admin) -->
          <a *ngIf="isAuthenticated && !isAdmin" routerLink="/profile/attempts" routerLinkActive="active" class="nav-link">
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
              <span *ngIf="isAdmin" class="admin-badge">ADMIN</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <div class="dropdown-menu" *ngIf="showDropdown">
              <div class="dropdown-header">
                <span>{{ username }}</span>
                <span *ngIf="isAdmin" class="admin-label">Administrator</span>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/profile/attempts" class="dropdown-item" (click)="closeDropdown()">
                📊 My Attempts
              </a>
              <div *ngIf="isAdmin" class="dropdown-divider"></div>
              <a *ngIf="isAdmin" routerLink="/admin/quiz/create" class="dropdown-item admin-action" (click)="closeDropdown()">
                ➕ Create Quiz
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

    /* ADMIN MENU STYLES */
    .admin-menu {
      position: relative;
    }

    .admin-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .admin-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .admin-icon {
      font-size: 18px;
    }

    .admin-text {
      font-size: 14px;
    }

    .admin-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      min-width: 220px;
      overflow: hidden;
      animation: fadeIn 0.2s ease-out;
      border: 2px solid #667eea;
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

    .admin-dropdown .dropdown-item {
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
      font-size: 14px;
    }

    .admin-dropdown .dropdown-item:hover {
      background: #f8f9ff;
      color: #667eea;
    }

    /* AUTH BUTTONS */
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

    /* USER MENU */
    .user-menu {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
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
      font-size: 14px;
    }

    .admin-badge {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
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
      min-width: 220px;
      overflow: hidden;
      animation: fadeIn 0.2s ease-out;
    }

    .dropdown-header {
      padding: 12px 20px;
      background: #f8f9ff;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
      color: #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .admin-label {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
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
      font-size: 14px;
    }

    .dropdown-item:hover {
      background: #f8f9ff;
    }

    .dropdown-item.admin-action {
      color: #667eea;
      font-weight: 600;
    }

    .dropdown-item.admin-action:hover {
      background: #f8f9ff;
      color: #764ba2;
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

      .admin-text {
        display: none;
      }

      .admin-button {
        padding: 8px 12px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private quizservice = inject(QuizService);

  isAuthenticated = false;
  isAdmin = false;
  username = '';
  showDropdown = false;
  showAdminMenu = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(username => {
      this.username = username || '';
      this.isAuthenticated = !!username;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    this.showAdminMenu = false; // Close admin menu when opening user menu
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  toggleAdminMenu(): void {
    this.showAdminMenu = !this.showAdminMenu;
    this.showDropdown = false; // Close user menu when opening admin menu
  }

  closeAdminMenu(): void {
    this.showAdminMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdown();
  }

  call():void{
    this.quizservice.getAvaibleQuizzName();
  }
}