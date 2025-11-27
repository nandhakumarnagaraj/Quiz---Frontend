export interface QuizSubmissionRequest {
  quizId: number;
  answers: AnswerSubmission[];
}

export interface AnswerSubmission {
  questionId: number;
  selectedOptionId: number;
}

export interface QuizResultResponse {
  attemptId: number;
  username: string;
  quizText: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  grade: string;
  attemptDate: string;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface AttemptHistoryResponse {
  attemptId: number;
  username: string;
  quizText: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  attemptDate: string;
}