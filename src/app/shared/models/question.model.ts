import { Option } from "./option.model";

export interface Question {
  questionId: number;
  questionText: string;
  options: Option[];
}