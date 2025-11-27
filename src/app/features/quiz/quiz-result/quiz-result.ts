// src/app/features/quiz/quiz-result/quiz-result.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizResultResponse } from '../../../shared/models/quiz-attempt.model';
import { QuizAttemptService } from '../../../core/services/attempt.service';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="result-container">
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading results...</p>
      </div>

      <div *ngIf="!isLoading && result" class="result-content">
        <!-- Score Summary -->
        <div class="score-card">
          <div class="score-header">
            <h1>Quiz Completed!</h1>
            <p class="quiz-title">{{ result.quizText }}</p>
          </div>

          <div class="score-display">
            <div class="score-circle" [class]="getGradeClass()">
              <div class="score-value">{{ result.percentage.toFixed(1) }}%</div>
              <div class="grade">{{ result.grade }}</div>
            </div>
          </div>

          <div class="score-details">
            <div class="detail-item">
              <span class="detail-label">Total Questions</span>
              <span class="detail-value">{{ result.totalQuestions }}</span>
            </div>
            <div class="detail-item success">
              <span class="detail-label">Correct Answers</span>
              <span class="detail-value">{{ result.correctAnswers }}</span>
            </div>
            <div class="detail-item error">
              <span class="detail-label">Wrong Answers</span>
              <span class="detail-value">{{ result.wrongAnswers }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Score</span>
              <span class="detail-value">{{ result.score }} / {{ result.totalQuestions }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-primary" routerLink="/quizzes">
              Browse Quizzes
            </button>
            <button class="btn btn-secondary" routerLink="/profile/attempts">
              View History
            </button>
          </div>
        </div>

        <!-- Question Review -->
        <div class="review-section">
          <h2>Question Review</h2>
          
          <div class="question-review" *ngFor="let qr of result.questionResults; let i = index">
            <div class="review-header">
              <span class="question-number">Question {{ i + 1 }}</span>
              <span class="result-badge" [class.correct]="qr.isCorrect" [class.incorrect]="!qr.isCorrect">
                {{ qr.isCorrect ? '✓ Correct' : '✗ Incorrect' }}
              </span>
            </div>

            <div class="review-question">{{ qr.questionText }}</div>

            <div class="review-answers">
              <div class="answer-item" [class.selected]="true" [class.correct]="qr.isCorrect" [class.incorrect]="!qr.isCorrect">
                <span class="answer-label">Your Answer:</span>
                <span class="answer-text">{{ qr.selectedAnswer }}</span>
              </div>

              <div class="answer-item correct" *ngIf="!qr.isCorrect">
                <span class="answer-label">Correct Answer:</span>
                <span class="answer-text">{{ qr.correctAnswer }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-container {
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

    .score-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
      text-align: center;
    }

    .score-header h1 {
      margin: 0 0 10px;
      color: #333;
      font-size: 32px;
    }

    .quiz-title {
      color: #667eea;
      font-size: 18px;
      margin: 0 0 30px;
    }

    .score-display {
      margin: 30px 0;
      display: flex;
      justify-content: center;
    }

    .score-circle {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 8px solid;
      position: relative;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .score-circle.excellent {
      border-color: #4caf50;
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.2));
    }

    .score-circle.good {
      border-color: #2196f3;
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2));
    }

    .score-circle.average {
      border-color: #ff9800;
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.2));
    }

    .score-circle.poor {
      border-color: #f44336;
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.2));
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
      color: #333;
    }

    .grade {
      font-size: 24px;
      font-weight: 600;
      margin-top: 10px;
      color: #667eea;
    }

    .score-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }

    .detail-item {
      padding: 20px;
      background: #f8f9ff;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .detail-item.success {
      background: #e8f5e9;
      border-left-color: #4caf50;
    }

    .detail-item.error {
      background: #ffebee;
      border-left-color: #f44336;
    }

    .detail-label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .detail-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }

    .btn {
      flex: 1;
      padding: 14px 30px;
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

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .review-section {
      margin-top: 40px;
    }

    .review-section h2 {
      margin-bottom: 20px;
      color: #333;
    }

    .question-review {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .question-number {
      font-weight: 600;
      color: #667eea;
    }

    .result-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .result-badge.correct {
      background: #e8f5e9;
      color: #4caf50;
    }

    .result-badge.incorrect {
      background: #ffebee;
      color: #f44336;
    }

    .review-question {
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
      font-weight: 500;
    }

    .review-answers {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .answer-item {
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .answer-item.selected.correct {
      background: #e8f5e9;
      border-left-color: #4caf50;
    }

    .answer-item.selected.incorrect {
      background: #ffebee;
      border-left-color: #f44336;
    }

    .answer-item.correct {
      background: #e8f5e9;
      border-left-color: #4caf50;
    }

    .answer-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .answer-text {
      display: block;
      color: #333;
    }
  `]
})
export class QuizResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizAttemptService = inject(QuizAttemptService);

  result: QuizResultResponse | null = null;
  isLoading = true;

  ngOnInit(): void {
    const attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    this.loadResult(attemptId);
  }

  loadResult(attemptId: number): void {
    this.quizAttemptService.getAttemptDetails(attemptId).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/quizzes']);
      }
    });
  }

  getGradeClass(): string {
    if (!this.result) return '';
    const percentage = this.result.percentage;
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  }
}