// src/app/features/quiz/quiz-list/quiz-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz } from '../../../shared/models/quiz.model';
import { ToastrService } from 'ngx-toastr';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="quiz-list-container">
      <div class="header">
        <h1>Available Quizzes</h1>
        <div class="header-actions" *ngIf="isAdmin">
          <button class="btn btn-primary" routerLink="/admin/quiz/create">
            <span class="icon">+</span> Create New Quiz
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading quizzes...</p>
      </div>

      <div *ngIf="!isLoading && quizzes.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>No Quizzes Available</h2>
        <p>Check back later or create a new quiz if you're an admin.</p>
      </div>

      <div class="quiz-grid" *ngIf="!isLoading && quizzes.length > 0">
        <div class="quiz-card" *ngFor="let quiz of quizzes">
          <div class="quiz-card-header">
            <h2>{{ quiz.quizText }}</h2>
            <span class="question-count">{{ quiz.questions.length }} Questions</span>
          </div>
          
          <div class="quiz-card-body">
            <div class="quiz-info">
              <div class="info-item">
                <span class="icon">❓</span>
                <span>{{ quiz.questions.length }} questions</span>
              </div>
              <div class="info-item">
                <span class="icon">⏱️</span>
                <span>~{{ quiz.questions.length * 2 }} min</span>
              </div>
            </div>
          </div>

          <div class="quiz-card-footer">
            <button 
              class="btn btn-outline" 
              [routerLink]="['/quizzes', quiz.quizId]"
            >
              View Details
            </button>
            <button 
              *ngIf="isAuthenticated"
              class="btn btn-primary" 
              [routerLink]="['/quizzes', quiz.quizId, 'take']"
            >
              Take Quiz
            </button>
            <button 
              *ngIf="!isAuthenticated"
              class="btn btn-primary" 
              (click)="navigateToLogin()"
            >
              Login to Take
            </button>
          </div>

          <div class="admin-actions" *ngIf="isAdmin">
            <button 
              class="btn-icon" 
              [routerLink]="['/admin/quiz/edit', quiz.quizId]"
              title="Edit Quiz"
            >
              ✏️
            </button>
            <button 
              class="btn-icon delete" 
              (click)="deleteQuiz(quiz.quizId)"
              title="Delete Quiz"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .quiz-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      position: relative;
    }

    .quiz-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .quiz-card-header h2 {
      margin: 0 0 8px;
      color: #333;
      font-size: 20px;
    }

    .question-count {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .quiz-card-body {
      margin: 20px 0;
    }

    .quiz-info {
      display: flex;
      gap: 20px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .info-item .icon {
      font-size: 18px;
    }

    .quiz-card-footer {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      flex: 1;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-outline {
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .admin-actions {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .btn-icon:hover {
      background: #f5f5f5;
      transform: scale(1.1);
    }

    .btn-icon.delete:hover {
      background: #ffebee;
      border-color: #f44336;
    }
  `]
})
export class QuizListComponent implements OnInit {
  private quizService = inject(QuizService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  quizzes: Quiz[] = [];
  isLoading = true;
  isAuthenticated = false;
  isAdmin = false;

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }

  deleteQuiz(quizId: number): void {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    this.quizService.deleteQuiz(quizId).subscribe({
      next: () => {
        this.toastr.success('Quiz deleted successfully', 'Success');
        this.loadQuizzes();
      },
      error: () => {
        // Error handled by interceptor
      }
    });
  }
}