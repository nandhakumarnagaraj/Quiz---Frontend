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
        <div class="header-title">
          <h1>{{ isAdmin ? '📋 Manage Quizzes' : '🎓 Available Quizzes' }}</h1>
          <p class="subtitle">{{ isAdmin ? 'Create, edit, or delete quizzes' : 'Choose a quiz to start' }}</p>
        </div>
        <div class="header-actions" *ngIf="isAdmin">
          <button class="btn btn-primary btn-large" routerLink="/admin/quiz/create">
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
        <p *ngIf="!isAdmin">Check back later or contact admin for more quizzes.</p>
        <p *ngIf="isAdmin">Create your first quiz to get started!</p>
        <button *ngIf="isAdmin" class="btn btn-primary" routerLink="/admin/quiz/create">
          Create First Quiz
        </button>
      </div>

      <div class="quiz-grid" *ngIf="!isLoading && quizzes.length > 0">
        <div class="quiz-card" *ngFor="let quiz of quizzes" [class.admin-card]="isAdmin">
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
              *ngIf="isAuthenticated && !isAdmin"
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

          <!-- ADMIN CONTROL PANEL -->
          <div class="admin-panel" *ngIf="isAdmin">
            <div class="admin-header">
              <span class="admin-label">🔧 Admin Controls</span>
            </div>
            <div class="admin-actions">
              <button 
                class="admin-btn edit" 
                [routerLink]="['/admin/quiz/edit', quiz.quizId]"
                title="Edit this quiz"
              >
                <span class="btn-icon">✏️</span>
                <span class="btn-text">Edit</span>
              </button>
              <button 
                class="admin-btn delete" 
                (click)="deleteQuiz(quiz.quizId)"
                title="Delete this quiz"
              >
                <span class="btn-icon">🗑️</span>
                <span class="btn-text">Delete</span>
              </button>
              <button 
                class="admin-btn preview" 
                [routerLink]="['/quizzes', quiz.quizId]"
                title="Preview quiz"
              >
                <span class="btn-icon">👁️</span>
                <span class="btn-text">Preview</span>
              </button>
            </div>
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
      align-items: flex-start;
      margin-bottom: 40px;
    }

    .header-title {
      flex: 1;
    }

    .header-title h1 {
      margin: 0 0 8px;
      color: #333;
      font-size: 32px;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .btn-large {
      padding: 14px 28px;
      font-size: 16px;
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
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }

    .quiz-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .quiz-card.admin-card {
      border-left: 4px solid #667eea;
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
      flex-grow: 1;
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
      margin-bottom: 12px;
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

    /* ADMIN PANEL */
    .admin-panel {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      background: #f8f9ff;
      border-radius: 8px;
      padding: 16px;
      margin: 20px -24px -24px -24px;
    }

    .admin-header {
      margin-bottom: 12px;
    }

    .admin-label {
      font-weight: 700;
      color: #667eea;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .admin-actions {
      display: flex;
      gap: 10px;
      justify-content: space-between;
    }

    .admin-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.3s;
    }

    .admin-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .admin-btn.edit {
      border-color: #2196f3;
      color: #2196f3;
    }

    .admin-btn.edit:hover {
      background: #e3f2fd;
      border-color: #1976d2;
    }

    .admin-btn.delete {
      border-color: #f44336;
      color: #f44336;
    }

    .admin-btn.delete:hover {
      background: #ffebee;
      border-color: #d32f2f;
    }

    .admin-btn.preview {
      border-color: #ff9800;
      color: #ff9800;
    }

    .admin-btn.preview:hover {
      background: #fff3e0;
      border-color: #f57c00;
    }

    .btn-icon {
      font-size: 16px;
    }

    .btn-text {
      display: none;
    }

    @media (min-width: 768px) {
      .btn-text {
        display: inline;
      }
    }

    @media (max-width: 768px) {
      .quiz-grid {
        grid-template-columns: 1fr;
      }

      .quiz-card-footer {
        flex-direction: column;
      }

      .admin-actions {
        flex-direction: column;
      }
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
    if (!confirm('⚠️ Are you sure you want to delete this quiz? This action cannot be undone.')) return;

    this.quizService.deleteQuiz(quizId).subscribe({
      next: () => {
        this.toastr.success('Quiz deleted successfully! ✓', 'Success');
        this.loadQuizzes();
      },
      error: () => {
        // Error handled by interceptor
      }
    });
  }
}