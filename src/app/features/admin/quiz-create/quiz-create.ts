// src/app/features/admin/quiz-create/quiz-create.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-container">
      <div class="header">
        <h1>Create New Quiz</h1>
        <p class="subtitle">Build an engaging quiz with multiple choice questions</p>
      </div>

      <form [formGroup]="quizForm" (ngSubmit)="onSubmit()">
        <!-- Quiz Title -->
        <div class="form-section">
          <label class="section-label">Quiz Title</label>
          <input 
            type="text" 
            formControlName="quizText" 
            placeholder="Enter quiz title"
            class="form-control"
            [class.invalid]="quizForm.get('quizText')?.invalid && quizForm.get('quizText')?.touched"
          />
          <div class="error-message" *ngIf="quizForm.get('quizText')?.invalid && quizForm.get('quizText')?.touched">
            Quiz title is required
          </div>
        </div>

        <!-- Questions -->
        <div class="questions-section" formArrayName="questions">
          <div class="section-header">
            <h2>Questions</h2>
            <button type="button" class="btn btn-primary" (click)="addQuestion()">
              + Add Question
            </button>
          </div>

          <div 
            class="question-card" 
            *ngFor="let question of questions.controls; let qi = index"
            [formGroupName]="qi"
          >
            <div class="question-header">
              <span class="question-number">Question {{ qi + 1 }}</span>
              <button 
                type="button" 
                class="btn-icon delete" 
                (click)="removeQuestion(qi)"
                *ngIf="questions.length > 1"
              >
                🗑️
              </button>
            </div>

            <div class="form-group">
              <label>Question Text</label>
              <textarea 
                formControlName="questionText" 
                placeholder="Enter question text"
                class="form-control"
                rows="2"
              ></textarea>
            </div>

            <!-- Options -->
            <div class="options-section" formArrayName="options">
              <label class="options-label">Answer Options (Mark the correct answer)</label>
              
              <div 
                class="option-item" 
                *ngFor="let option of getOptions(qi).controls; let oi = index"
                [formGroupName]="oi"
              >
                <div class="option-checkbox">
                  <input 
                    type="checkbox" 
                    [id]="'q' + qi + 'o' + oi"
                    formControlName="correct"
                    (change)="onCorrectAnswerChange(qi, oi)"
                  />
                  <label [for]="'q' + qi + 'o' + oi" class="checkbox-label">Correct</label>
                </div>
                
                <input 
                  type="text" 
                  formControlName="optionText" 
                  placeholder="Option {{ oi + 1 }}"
                  class="form-control flex-grow"
                />

                <button 
                  type="button" 
                  class="btn-icon delete" 
                  (click)="removeOption(qi, oi)"
                  *ngIf="getOptions(qi).length > 2"
                >
                  ✕
                </button>
              </div>

              <button 
                type="button" 
                class="btn btn-outline btn-sm" 
                (click)="addOption(qi)"
                *ngIf="getOptions(qi).length < 6"
              >
                + Add Option
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="cancel()"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-success"
            [disabled]="quizForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Creating...' : 'Create Quiz' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      margin-bottom: 40px;
    }

    .header h1 {
      margin: 0 0 10px;
      color: #333;
    }

    .subtitle {
      color: #666;
      margin: 0;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section-label {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.invalid {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 5px;
    }

    .questions-section {
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      margin: 0;
      color: #333;
    }

    .question-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .question-number {
      font-weight: 600;
      color: #667eea;
      font-size: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    .options-section {
      margin-top: 20px;
    }

    .options-label {
      display: block;
      margin-bottom: 12px;
      color: #333;
      font-weight: 500;
    }

    .option-item {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }

    .option-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 90px;
    }

    .option-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-label {
      font-size: 14px;
      color: #666;
      cursor: pointer;
      margin: 0;
    }

    .flex-grow {
      flex: 1;
    }

    .btn {
      padding: 10px 20px;
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

    .btn-success {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-outline {
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 12px;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      transition: all 0.3s;
    }

    .btn-icon:hover {
      transform: scale(1.2);
    }

    .btn-icon.delete:hover {
      filter: brightness(0) saturate(100%) invert(29%) sepia(97%) saturate(4943%) hue-rotate(349deg);
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-actions .btn {
      min-width: 120px;
    }
  `]
})
export class QuizCreateComponent {
  private fb = inject(FormBuilder);
  private quizService = inject(QuizService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  quizForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.quizForm = this.fb.group({
      quizText: ['', Validators.required],
      questions: this.fb.array([])
    });

    // Add initial question
    this.addQuestion();
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  createQuestion(): FormGroup {
    const questionGroup = this.fb.group({
      questionText: ['', Validators.required],
      options: this.fb.array([])
    });

    // Add 4 default options
    for (let i = 0; i < 4; i++) {
      this.addOptionToGroup(questionGroup);
    }

    return questionGroup;
  }

  createOption(): FormGroup {
    return this.fb.group({
      optionText: ['', Validators.required],
      correct: [false]
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.push(this.createOption());
  }

  addOptionToGroup(questionGroup: FormGroup): void {
    const options = questionGroup.get('options') as FormArray;
    options.push(this.createOption());
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
    }
  }

  onCorrectAnswerChange(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    // Uncheck all other options
    options.controls.forEach((control, index) => {
      if (index !== optionIndex) {
        control.get('correct')?.setValue(false);
      }
    });
  }

  onSubmit(): void {
    if (this.quizForm.invalid) {
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // Validate that each question has at least one correct answer
    const questions = this.quizForm.value.questions;
    for (let i = 0; i < questions.length; i++) {
      const hasCorrectAnswer = questions[i].options.some((opt: any) => opt.correct);
      if (!hasCorrectAnswer) {
        this.toastr.error(`Question ${i + 1} must have a correct answer marked`, 'Validation Error');
        return;
      }
    }

    this.isSubmitting = true;
    this.quizService.createQuiz(this.quizForm.value).subscribe({
      next: (quiz) => {
        this.toastr.success('Quiz created successfully!', 'Success');
        this.router.navigate(['/quizzes', quiz.quizId]);
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      this.router.navigate(['/quizzes']);
    }
  }
}