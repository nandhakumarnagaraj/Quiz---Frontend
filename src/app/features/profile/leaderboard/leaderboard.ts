// src/app/features/profile/leaderboard/leaderboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttemptHistoryResponse } from '../../../shared/models/quiz-attempt.model';
import { Quiz } from '../../../shared/models/quiz.model';
import { QuizAttemptService } from '../../../core/services/attempt.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="leaderboard-container">
      <div class="header">
        <button class="back-button" routerLink="/quizzes">
          ← Back to Quizzes
        </button>
        <div class="header-content" *ngIf="quiz">
          <h1>🏆 Leaderboard</h1>
          <p class="quiz-title">{{ quiz.quizText }}</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>

      <div *ngIf="!isLoading && attempts.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h2>No Attempts Yet</h2>
        <p>Be the first to take this quiz!</p>
        <button class="btn btn-primary" [routerLink]="['/quizzes', quizId, 'take']">
          Take Quiz
        </button>
      </div>

      <div class="leaderboard-content" *ngIf="!isLoading && attempts.length > 0">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ attempts.length }}</div>
              <div class="stat-label">Total Attempts</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">{{ getAverageScore() }}%</div>
              <div class="stat-label">Average Score</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🥇</div>
            <div class="stat-info">
              <div class="stat-value">{{ getTopScore() }}%</div>
              <div class="stat-label">Top Score</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <div class="stat-value">{{ getPassRate() }}%</div>
              <div class="stat-label">Pass Rate</div>
            </div>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="controls">
          <div class="sort-options">
            <button 
              class="sort-btn"
              [class.active]="sortBy === 'percentage'"
              (click)="sortLeaderboard('percentage')"
            >
              🏆 By Score
            </button>
            <button 
              class="sort-btn"
              [class.active]="sortBy === 'date'"
              (click)="sortLeaderboard('date')"
            >
              📅 By Date
            </button>
          </div>

          <div class="filter-options">
            <button 
              class="filter-btn"
              [class.active]="showMyAttempts"
              (click)="toggleMyAttempts()"
            >
              {{ showMyAttempts ? 'Show All' : 'Show My Attempts' }}
            </button>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <div class="leaderboard-table">
          <div class="table-header">
            <div class="col-rank">Rank</div>
            <div class="col-user">User</div>
            <div class="col-score">Score</div>
            <div class="col-percentage">Percentage</div>
            <div class="col-grade">Grade</div>
            <div class="col-date">Date</div>
            <div class="col-action">Action</div>
          </div>

          <div 
            class="table-row" 
            *ngFor="let attempt of getFilteredAttempts(); let i = index"
            [class.highlight]="isCurrentUser(attempt.username)"
            [class.top-rank]="i < 3 && sortBy === 'percentage'"
          >
            <div class="col-rank">
              <span class="rank-badge" [class]="getRankClass(i)">
                {{ getRankIcon(i) }}
              </span>
            </div>

            <div class="col-user">
              <div class="user-info">
                <span class="user-icon">{{ isCurrentUser(attempt.username) ? '👤' : '👨‍💼' }}</span>
                <span class="username">
                  {{ attempt.username }}
                  <span class="you-badge" *ngIf="isCurrentUser(attempt.username)">You</span>
                </span>
              </div>
            </div>

            <div class="col-score">
              <span class="score-text">{{ attempt.score }}/{{ attempt.totalQuestions }}</span>
            </div>

            <div class="col-percentage">
              <div class="percentage-bar">
                <div class="percentage-fill" [style.width.%]="attempt.percentage" [class]="getPercentageClass(attempt.percentage)"></div>
                <span class="percentage-text">{{ attempt.percentage.toFixed(1) }}%</span>
              </div>
            </div>

            <div class="col-grade">
              <span class="grade-badge" [class]="getGradeClass(attempt.grade)">
                {{ attempt.grade }}
              </span>
            </div>

            <div class="col-date">
              <span class="date-text">{{ formatDate(attempt.attemptDate) }}</span>
            </div>

            <div class="col-action">
              <button 
                class="btn-action"
                [routerLink]="['/quizzes/result', attempt.attemptId]"
                title="View Details"
              >
                👁️ View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      margin-bottom: 30px;
    }

    .back-button {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      transition: all 0.3s;
      margin-bottom: 20px;
    }

    .back-button:hover {
      background: #f8f9ff;
      border-color: #667eea;
    }

    .header-content {
      text-align: center;
    }

    .header-content h1 {
      margin: 0 0 10px;
      color: #333;
      font-size: 36px;
    }

    .quiz-title {
      color: #667eea;
      font-size: 20px;
      margin: 0;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 48px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .sort-options, .filter-options {
      display: flex;
      gap: 10px;
    }

    .sort-btn, .filter-btn {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      transition: all 0.3s;
    }

    .sort-btn:hover, .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .sort-btn.active, .filter-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }

    .leaderboard-table {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 80px 1fr 100px 200px 80px 150px 100px;
      gap: 16px;
      padding: 16px 20px;
      align-items: center;
    }

    .table-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .table-row {
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.3s;
    }

    .table-row:hover {
      background: #f8f9ff;
    }

    .table-row.highlight {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .table-row.top-rank {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), transparent);
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 18px;
    }

    .rank-badge.gold {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
    }

    .rank-badge.silver {
      background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
    }

    .rank-badge.bronze {
      background: linear-gradient(135deg, #cd7f32, #e8a87c);
    }

    .rank-badge.normal {
      background: #f0f0f0;
      color: #666;
      font-size: 14px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-icon {
      font-size: 24px;
    }

    .username {
      font-weight: 600;
      color: #333;
    }

    .you-badge {
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      margin-left: 8px;
      font-weight: 700;
    }

    .score-text {
      font-weight: 600;
      color: #333;
    }

    .percentage-bar {
      position: relative;
      height: 30px;
      background: #f0f0f0;
      border-radius: 15px;
      overflow: hidden;
    }

    .percentage-fill {
      height: 100%;
      transition: width 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
    }

    .percentage-fill.excellent {
      background: linear-gradient(90deg, #4caf50, #66bb6a);
    }

    .percentage-fill.good {
      background: linear-gradient(90deg, #2196f3, #42a5f5);
    }

    .percentage-fill.average {
      background: linear-gradient(90deg, #ff9800, #ffa726);
    }

    .percentage-fill.poor {
      background: linear-gradient(90deg, #f44336, #ef5350);
    }

    .percentage-text {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-weight: 700;
      color: #333;
      font-size: 12px;
    }

    .grade-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
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

    .date-text {
      color: #666;
      font-size: 13px;
    }

    .btn-action {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    @media (max-width: 1024px) {
      .table-header, .table-row {
        grid-template-columns: 60px 1fr 80px 150px 70px 120px 80px;
        gap: 10px;
        font-size: 12px;
      }
    }

    @media (max-width: 768px) {
      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .col-rank, .col-user, .col-score, .col-percentage, 
      .col-grade, .col-date, .col-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .col-rank::before { content: 'Rank: '; font-weight: 600; }
      .col-user::before { content: 'User: '; font-weight: 600; }
      .col-score::before { content: 'Score: '; font-weight: 600; }
      .col-percentage::before { content: 'Percentage: '; font-weight: 600; }
      .col-grade::before { content: 'Grade: '; font-weight: 600; }
      .col-date::before { content: 'Date: '; font-weight: 600; }

      .table-header {
        display: none;
      }

      .table-row {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 10px;
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quizAttemptService = inject(QuizAttemptService);
  private quizService = inject(QuizService);
  private authService = inject(AuthService);

  attempts: AttemptHistoryResponse[] = [];
  quiz: Quiz | null = null;
  quizId!: number;
  isLoading = true;
  sortBy: 'percentage' | 'date' = 'percentage';
  showMyAttempts = false;
  currentUsername = '';

  ngOnInit(): void {
    this.currentUsername = this.authService.getUsername() || '';
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadLeaderboard();
    this.loadQuiz();
  }

  loadLeaderboard(): void {
    this.quizAttemptService.getQuizLeaderboard(this.quizId).subscribe({
      next: (attempts) => {
        this.attempts = attempts;
        this.sortLeaderboard('percentage');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadQuiz(): void {
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
      },
      error: () => {
        // Quiz title not critical
      }
    });
  }

  sortLeaderboard(sortBy: 'percentage' | 'date'): void {
    this.sortBy = sortBy;
    if (sortBy === 'percentage') {
      this.attempts.sort((a, b) => b.percentage - a.percentage);
    } else {
      this.attempts.sort((a, b) => 
        new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
      );
    }
  }

  toggleMyAttempts(): void {
    this.showMyAttempts = !this.showMyAttempts;
  }

  getFilteredAttempts(): AttemptHistoryResponse[] {
    if (this.showMyAttempts) {
      return this.attempts.filter(a => a.username === this.currentUsername);
    }
    return this.attempts;
  }

  isCurrentUser(username: string): boolean {
    return username === this.currentUsername;
  }

  getRankIcon(index: number): string {
    if (this.sortBy !== 'percentage') return `#${index + 1}`;
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }

  getRankClass(index: number): string {
    if (this.sortBy !== 'percentage') return 'normal';
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return 'normal';
  }

  getGradeClass(grade: string): string {
    if (['A+', 'A'].includes(grade)) return 'excellent';
    if (grade === 'B') return 'good';
    if (grade === 'C') return 'average';
    return 'poor';
  }

  getPercentageClass(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  }

  getAverageScore(): string {
    if (this.attempts.length === 0) return '0.0';
    const sum = this.attempts.reduce((acc, curr) => acc + curr.percentage, 0);
    return (sum / this.attempts.length).toFixed(1);
  }

  getTopScore(): string {
    if (this.attempts.length === 0) return '0.0';
    const max = Math.max(...this.attempts.map(a => a.percentage));
    return max.toFixed(1);
  }

  getPassRate(): string {
    if (this.attempts.length === 0) return '0.0';
    const passed = this.attempts.filter(a => a.percentage >= 50).length;
    return ((passed / this.attempts.length) * 100).toFixed(1);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}