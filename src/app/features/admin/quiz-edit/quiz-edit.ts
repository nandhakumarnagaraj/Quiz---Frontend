import { CommonModule } from '@angular/common';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../shared/models/quiz.model';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="edit-container">
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading quiz...</p>
      </div>

      <div *ngIf="!isLoading && quizForm">
        <div class="header">
          <h1>Edit Quiz</h1>
          <p class="subtitle">Update quiz information and questions</p>
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
                <div class="question-actions">
                  <button 
                    type="button" 
                    class="btn-icon" 
                    (click)="moveQuestionUp(qi)"
                    *ngIf="qi > 0"
                    title="Move Up"
                  >
                    ⬆️
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon" 
                    (click)="moveQuestionDown(qi)"
                    *ngIf="qi < questions.length - 1"
                    title="Move Down"
                  >
                    ⬇️
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon delete" 
                    (click)="removeQuestion(qi)"
                    *ngIf="questions.length > 1"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
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
              type="button" 
              class="btn btn-danger"
              (click)="deleteQuiz()"
            >
              Delete Quiz
            </button>
            <button 
              type="submit" 
              class="btn btn-success"
              [disabled]="quizForm.invalid || isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .edit-container {
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

    .question-actions {
      display: flex;
      gap: 8px;
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

    .btn-danger {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
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
export class QuizEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private quizService = inject(QuizService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  quizForm!: FormGroup;
  quizId!: number;
  originalQuiz!: Quiz;
  isLoading = true;
  isSubmitting = false;

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.originalQuiz = quiz;
        this.buildForm(quiz);
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load quiz', 'Error');
        this.router.navigate(['/quizzes']);
      }
    });
  }

  buildForm(quiz: Quiz): void {
    this.quizForm = this.fb.group({
      quizText: [quiz.quizText, Validators.required],
      questions: this.fb.array([])
    });

    // Populate questions
    quiz.questions.forEach(question => {
      const questionGroup = this.fb.group({
        questionId: [question.questionId],
        questionText: [question.questionText, Validators.required],
        options: this.fb.array([])
      });

      // Populate options
      const optionsArray = questionGroup.get('options') as FormArray;
      question.options.forEach(option => {
        optionsArray.push(this.fb.group({
          optionId: [option.optionId],
          optionText: [option.optionText, Validators.required],
          correct: [option.correct]
        }));
      });

      this.questions.push(questionGroup);
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  createQuestion(): FormGroup {
    const questionGroup = this.fb.group({
      questionId: [0], // 0 indicates new question
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
      optionId: [0], // 0 indicates new option
      optionText: ['', Validators.required],
      correct: [false]
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      if (confirm('Are you sure you want to remove this question?')) {
        this.questions.removeAt(index);
      }
    } else {
      this.toastr.warning('Quiz must have at least one question', 'Warning');
    }
  }

  moveQuestionUp(index: number): void {
    if (index > 0) {
      const question = this.questions.at(index);
      this.questions.removeAt(index);
      this.questions.insert(index - 1, question);
    }
  }

  moveQuestionDown(index: number): void {
    if (index < this.questions.length - 1) {
      const question = this.questions.at(index);
      this.questions.removeAt(index);
      this.questions.insert(index + 1, question);
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
      if (confirm('Are you sure you want to remove this option?')) {
        options.removeAt(optionIndex);
      }
    } else {
      this.toastr.warning('Question must have at least 2 options', 'Warning');
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
    this.quizService.updateQuiz(this.quizId, this.quizForm.value).subscribe({
      next: (quiz) => {
        this.toastr.success('Quiz updated successfully!', 'Success');
        this.router.navigate(['/quizzes', quiz.quizId]);
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  deleteQuiz(): void {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    this.quizService.deleteQuiz(this.quizId).subscribe({
      next: () => {
        this.toastr.success('Quiz deleted successfully', 'Success');
        this.router.navigate(['/quizzes']);
      },
      error: () => {
        // Error handled by interceptor
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/quizzes', this.quizId]);
    }
  }
}