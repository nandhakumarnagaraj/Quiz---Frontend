import { Routes } from '@angular/router';
import { QuizCreateComponent } from './quiz-create/quiz-create';
import { QuizEditComponent } from './quiz-edit/quiz-edit';


export const ADMIN_ROUTES: Routes = [
  { path: 'quiz/create', component: QuizCreateComponent },
  { path: 'quiz/edit/:id', component: QuizEditComponent },
  { path: '', redirectTo: 'quiz/create', pathMatch: 'full' }
];
