import { Question } from "./question.model";

export interface Quiz {
  quizId: number;
  quizText: string;
  questions: Question[];
}
export interface QuizCreateRequest {
  quizText: string;
  questions: QuestionCreateRequest[];
}

export interface QuestionCreateRequest {
  questionId?: number;
  questionText: string;
  options: OptionCreateRequest[];
}

export interface OptionCreateRequest {
  optionId?: number;
  optionText: string;
  correct: boolean;
}
