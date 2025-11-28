import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz } from '../../../shared/models/quiz.model';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="detail-container">
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <div *ngIf="!isLoading && isNamesList" class="quiz-detail">
        <div class="detail-header">
          <div class="header-content">
            <h1>Available Quiz Names</h1>
            <div class="quiz-meta">
              <span class="meta-item">📚 Total Available: {{ quizNames.length }}</span>
            </div>
          </div>
          <div class="header-actions">
             <button class="btn btn-outline" routerLink="/auth/login">Login to Start</button>
          </div>
        </div>

        <div class="questions-preview">
          <h2>Quiz List</h2>
          <div class="question-list">
            <div class="question-item" *ngFor="let name of quizNames; let i = index">
              <div class="question-header">
                <span class="question-number">{{ i + 1 }}</span>
                <h3>{{ name }}</h3>
              </div>
            </div>
            
            <div *ngIf="quizNames.length === 0" class="empty-state">
              <p>No quiz names found.</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !isNamesList && quiz" class="quiz-detail">
        <div class="detail-header">
          <div class="header-content">
            <h1>{{ quiz.quizText }}</h1>
            <div class="quiz-meta">
              <span class="meta-item">📝 {{ quiz.questions.length }} Questions</span>
              <span class="meta-item">⏱️ ~{{ quiz.questions.length * 2 }} minutes</span>
            </div>
          </div>
          
          <div class="header-actions">
            <button 
              *ngIf="isAuthenticated"
              class="btn btn-primary btn-large"
              [routerLink]="['/quizzes', quiz.quizId, 'take']"
            >
              Start Quiz
            </button>
            <button 
              *ngIf="!isAuthenticated"
              class="btn btn-primary btn-large"
              (click)="navigateToLogin()"
            >
              Login to Start
            </button>
            <button 
              *ngIf="isAdmin"
              class="btn btn-outline"
              [routerLink]="['/admin/quiz/edit', quiz.quizId]"
            >
              Edit Quiz
            </button>
          </div>
        </div>

        <div class="questions-preview">
          <h2>Questions Preview</h2>
          <div class="question-list">
            <div class="question-item" *ngFor="let question of quiz.questions; let i = index">
              <div class="question-header">
                <span class="question-number">Q{{ i + 1 }}</span>
                <h3>{{ question.questionText }}</h3>
              </div>
              <div class="options-preview">
                <div class="option-preview" *ngFor="let option of question.options">
                  <span class="option-bullet">•</span>
                  <span>{{ option.optionText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
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

    .detail-header {
      background: white;
      border-radius: 12px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .detail-header h1 {
      margin: 0 0 20px;
      color: #333;
    }

    .quiz-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .meta-item {
      color: #666;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 15px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 18px;
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

    .questions-preview {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .questions-preview h2 {
      margin: 0 0 30px;
      color: #333;
    }

    .question-item {
      border-left: 4px solid #667eea;
      padding: 20px;
      margin-bottom: 24px;
      background: #f8f9ff;
      border-radius: 8px;
    }

    .question-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .question-number {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .question-header h3 {
      margin: 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .options-preview {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-left: 56px;
    }

    .option-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .option-bullet {
      color: #667eea;
      font-size: 20px;
    }
    
    .empty-state {
      text-align: center;
      color: #666;
      padding: 20px;
    }
  `]
})
export class QuizDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizService = inject(QuizService);
  private authService = inject(AuthService);

  // State for Single Quiz View
  quiz: Quiz | null = null;
  
  // State for Quiz Names List View
  quizNames: string[] = [];
  isNamesList = false;

  // Shared State
  isLoading = true;
  isAuthenticated = false;
  isAdmin = false;

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
    
    // Check the route parameter 'id'
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === 'names') {
      // MODE 1: Names List
      this.isNamesList = true;
      this.loadQuizNames();
    } else {
      // MODE 2: Single Quiz Detail
      this.isNamesList = false;
      const quizId = Number(idParam);
      if (!isNaN(quizId)) {
        this.loadQuiz(quizId);
      } else {
        // Fallback for invalid IDs
        this.router.navigate(['/quizzes']);
      }
    }
  }

  loadQuiz(quizId: number): void {
    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/quizzes']);
      }
    });
  }

  loadQuizNames(): void {
    this.quizService.getAvaibleQuizzName().subscribe({
      next: (names) => {
        this.quizNames = names;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load names', err);
        this.isLoading = false;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }
}