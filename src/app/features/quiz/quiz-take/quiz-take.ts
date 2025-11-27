// src/app/features/quiz/quiz-take/quiz-take.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Quiz } from '../../../shared/models/quiz.model';
import { AnswerSubmission } from '../../../shared/models/quiz-attempt.model';
import { ToastrService } from 'ngx-toastr';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizAttemptService } from '../../../core/services/attempt.service';
import { Question } from '../../../shared/models/question.model';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quiz-container">
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading quiz...</p>
      </div>

      <div *ngIf="!isLoading && quiz" class="quiz-content">
        <div class="quiz-header">
          <h1>{{ quiz.quizText }}</h1>
          <div class="progress-info">
            <span class="current-question">Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progress"></div>
            </div>
          </div>
        </div>

        <div class="question-card" *ngIf="currentQuestion">
          <h2 class="question-text">{{ currentQuestion.questionText }}</h2>
          
          <div class="options-container">
            <div 
              class="option-card"
              *ngFor="let option of currentQuestion.options; let i = index"
              [class.selected]="selectedOptions[currentQuestion.questionId] === option.optionId"
              (click)="selectOption(option.optionId)"
            >
              <div class="option-radio">
                <div class="radio-inner"></div>
              </div>
              <span class="option-text">{{ option.optionText }}</span>
            </div>
          </div>

          <div class="navigation-buttons">
            <button 
              class="btn btn-secondary"
              *ngIf="currentQuestionIndex > 0"
              (click)="previousQuestion()"
            >
              ← Previous
            </button>
            <button 
              class="btn btn-primary"
              *ngIf="currentQuestionIndex < quiz.questions.length - 1"
              [disabled]="!selectedOptions[currentQuestion.questionId]"
              (click)="nextQuestion()"
            >
              Next →
            </button>
            <button 
              class="btn btn-success"
              *ngIf="currentQuestionIndex === quiz.questions.length - 1"
              [disabled]="!isAllQuestionsAnswered()"
              (click)="submitQuiz()"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Quiz' }}
            </button>
          </div>

          <div class="question-indicator">
            <div 
              class="indicator-dot"
              *ngFor="let question of quiz.questions; let i = index"
              [class.current]="i === currentQuestionIndex"
              [class.answered]="selectedOptions[question.questionId]"
              (click)="goToQuestion(i)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      max-width: 800px;
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

    .quiz-header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .quiz-header h1 {
      margin: 0 0 20px;
      color: #333;
    }

    .progress-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .current-question {
      color: #667eea;
      font-weight: 600;
    }

    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .question-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .question-text {
      color: #333;
      margin-bottom: 30px;
      font-size: 20px;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 30px;
    }

    .option-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .option-card:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .option-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .option-radio {
      width: 24px;
      height: 24px;
      border: 2px solid #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s;
    }

    .option-card.selected .option-radio {
      border-color: #667eea;
      background: #667eea;
    }

    .option-radio .radio-inner {
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .option-card.selected .radio-inner {
      opacity: 1;
    }

    .option-text {
      flex: 1;
      color: #333;
      font-size: 16px;
    }

    .navigation-buttons {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      flex: 1;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-success {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .question-indicator {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .indicator-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e0e0e0;
      cursor: pointer;
      transition: all 0.3s;
    }

    .indicator-dot.answered {
      background: #667eea;
    }

    .indicator-dot.current {
      width: 16px;
      height: 16px;
      background: #764ba2;
      box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.2);
    }
  `]
})
export class QuizTakeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizService = inject(QuizService);
  private quizAttemptService = inject(QuizAttemptService);
  private toastr = inject(ToastrService);

  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  selectedOptions: { [questionId: number]: number } = {};
  isLoading = true;
  isSubmitting = false;

  get currentQuestion(): Question | null {
    return this.quiz ? this.quiz.questions[this.currentQuestionIndex] : null;
  }

  get progress(): number {
    if (!this.quiz) return 0;
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuiz(quizId);
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

  selectOption(optionId: number): void {
    if (this.currentQuestion) {
      this.selectedOptions[this.currentQuestion.questionId] = optionId;
    }
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  isAllQuestionsAnswered(): boolean {
    if (!this.quiz) return false;
    return this.quiz.questions.every(q => this.selectedOptions[q.questionId]);
  }

  submitQuiz(): void {
    if (!this.quiz || !this.isAllQuestionsAnswered()) return;

    const answers: AnswerSubmission[] = Object.entries(this.selectedOptions).map(
      ([questionId, selectedOptionId]) => ({
        questionId: Number(questionId),
        selectedOptionId
      })
    );

    const submission = {
      quizId: this.quiz.quizId,
      answers
    };

    this.isSubmitting = true;
    this.quizAttemptService.submitQuiz(submission).subscribe({
      next: (result) => {
        this.toastr.success('Quiz submitted successfully!', 'Success');
        this.router.navigate(['/quizzes/result', result.attemptId]);
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}