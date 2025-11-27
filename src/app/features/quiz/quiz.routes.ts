import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { QuizDetailComponent } from './quiz-detail/quiz-detail.component';
import { QuizTakeComponent } from './quiz-take/quiz-take.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';

export const QUIZ_ROUTES: Routes = [
  { path: '', component: QuizListComponent },
  { path: ':id', component: QuizDetailComponent },
  { 
    path: ':id/take', 
    component: QuizTakeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'result/:attemptId', 
    component: QuizResultComponent,
    canActivate: [authGuard]
  }
];