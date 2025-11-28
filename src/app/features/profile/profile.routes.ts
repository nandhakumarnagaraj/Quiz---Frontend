
import { Routes } from '@angular/router';
import { AttemptHistoryComponent } from './attempt-history/attempt-history';
import { LeaderboardComponent } from './leaderboard/leaderboard';


export const PROFILE_ROUTES: Routes = [
  { path: 'attempts', component: AttemptHistoryComponent },
  { path: 'leaderboard/:quizId', component: LeaderboardComponent },
  { path: '', redirectTo: 'attempts', pathMatch: 'full' }
];