import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AttemptHistoryResponse, QuizResultResponse, QuizSubmissionRequest } from '../../shared/models/quiz-attempt.model';

@Injectable({
  providedIn: 'root'
})
export class QuizAttemptService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/quiz-attempts`;

  submitQuiz(submission: QuizSubmissionRequest): Observable<QuizResultResponse> {
    return this.http.post<QuizResultResponse>(`${this.apiUrl}/submit`, submission);
  }

  getMyAttempts(): Observable<AttemptHistoryResponse[]> {
    return this.http.get<AttemptHistoryResponse[]>(`${this.apiUrl}/my-attempts`);
  }

  getAttemptDetails(attemptId: number): Observable<QuizResultResponse> {
    return this.http.get<QuizResultResponse>(`${this.apiUrl}/${attemptId}`);
  }

  getQuizLeaderboard(quizId: number): Observable<AttemptHistoryResponse[]> {
    return this.http.get<AttemptHistoryResponse[]>(`${this.apiUrl}/leaderboard/${quizId}`);
  }
}