import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AttemptHistoryResponse } from '../../../shared/models/quiz-attempt.model';
import { QuizAttemptService } from '../../../core/services/attempt.service';

@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="history-container">
      <h1>My Quiz Attempts</h1>

      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading your attempts...</p>
      </div>

      <div *ngIf="!isLoading && attempts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>No Attempts Yet</h2>
        <p>Start taking quizzes to see your history here!</p>
        <button class="btn btn-primary" routerLink="/quizzes">Browse Quizzes</button>
      </div>

      <div class="attempts-grid" *ngIf="!isLoading && attempts.length > 0">
        <div class="attempt-card" *ngFor="let attempt of attempts">
          <div class="attempt-header">
            <h3>{{ attempt.quizText }}</h3>
            <span class="grade-badge" [class]="getGradeClass(attempt.grade)">
              {{ attempt.grade }}
            </span>
          </div>

          <div class="attempt-stats">
            <div class="stat-item">
              <span class="stat-label">Score</span>
              <span class="stat-value">{{ attempt.score }}/{{ attempt.totalQuestions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Percentage</span>
              <span class="stat-value">{{ attempt.percentage.toFixed(1) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Date</span>
              <span class="stat-value">{{ formatDate(attempt.attemptDate) }}</span>
            </div>
          </div>

          <button 
            class="btn btn-outline"
            [routerLink]="['/quizzes/result', attempt.attemptId]"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    h1 {
      margin-bottom: 30px;
      color: #333;
    }

    .loading, .empty-state {
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

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .attempts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .attempt-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }

    .attempt-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .attempt-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
    }

    .attempt-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      flex: 1;
    }

    .grade-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      margin-left: 10px;
    }

    .grade-badge.excellent {
      background: #e8f5e9;
      color: #4caf50;
    }

    .grade-badge.good {
      background: #e3f2fd;
      color: #2196f3;
    }

    .grade-badge.average {
      background: #fff3e0;
      color: #ff9800;
    }

    .grade-badge.poor {
      background: #ffebee;
      color: #f44336;
    }

    .attempt-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
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
  `]
})
export class AttemptHistoryComponent implements OnInit {
  private quizAttemptService = inject(QuizAttemptService);
  private router = inject(Router);

  attempts: AttemptHistoryResponse[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadAttempts();
  }

  loadAttempts(): void {
    this.quizAttemptService.getMyAttempts().subscribe({
      next: (attempts) => {
        this.attempts = attempts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getGradeClass(grade: string): string {
    if (['A+', 'A'].includes(grade)) return 'excellent';
    if (grade === 'B') return 'good';
    if (grade === 'C') return 'average';
    return 'poor';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}