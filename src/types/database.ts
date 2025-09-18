// Temporary database types to fix TypeScript errors
// This provides the correct types for the existing database tables

export interface Teacher {
  id: string;
  email: string;
  name: string;
  college_name: string;
  department: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  teacher_id: string;
  name: string;
  topic: string;
  access_code: string;
  duration_minutes: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string; // Changed to string to match database
  topic_tag: string;
  question_order: number;
  created_at: string;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  roll_number: string;
  created_at: string;
}

export interface Submission {
  id: string;
  exam_id: string;
  student_id: string;
  total_score: number;
  total_questions: number;
  time_taken_minutes: number | null;
  submitted_at: string | null;
}

export interface Response {
  id: string;
  submission_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean;
  created_at: string;
}

// Extended types with relations
export interface SubmissionWithRelations extends Submission {
  student: Student;
  exam: Exam;
}

export interface ResponseWithQuestion extends Response {
  question: Question;
}

// Override Database type to work with existing code
export type Database = {
  public: {
    Tables: {
      teachers: { Row: Teacher };
      exams: { Row: Exam };
      questions: { Row: Question };
      students: { Row: Student };
      submissions: { Row: Submission };
      responses: { Row: Response };
    };
  };
};