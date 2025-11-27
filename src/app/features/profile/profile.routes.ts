import { Routes } from '@angular/router';
import { AttemptHistoryComponent } from './attempt-history/attempt-history.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

export const PROFILE_ROUTES: Routes = [
  { path: 'attempts', component: AttemptHistoryComponent },
  { path: 'leaderboard/:quizId', component: LeaderboardComponent },
  { path: '', redirectTo: 'attempts', pathMatch: 'full' }
];