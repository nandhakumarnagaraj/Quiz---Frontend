import { Routes } from '@angular/router';
import { QuizListComponent } from './quiz-list/quiz-list';
import { QuizDetailComponent } from './quiz-detail/quiz-detail';
import { QuizTakeComponent } from './quiz-take/quiz-take';
import { authGuard } from '../../core/guards/auth-guard';
import { QuizResultComponent } from './quiz-result/quiz-result';


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