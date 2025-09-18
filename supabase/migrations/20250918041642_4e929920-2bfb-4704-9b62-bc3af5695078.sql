-- Create the complete database schema for the exam system

-- 1. Create teachers table
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  college_name text NOT NULL,
  department text NOT NULL,
  password_hash text DEFAULT '', -- Supabase handles auth
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 2. Create exams table
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  name text NOT NULL,
  topic text NOT NULL,
  access_code text UNIQUE NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 3. Create questions table  
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  topic_tag text,
  question_order integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 4. Create students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  roll_number text NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 5. Create submissions table
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  student_id uuid NOT NULL,
  total_score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken_minutes integer,
  submitted_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- 6. Create responses table
CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  question_id uuid NOT NULL,
  selected_answer text,
  is_correct boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- 7. Add foreign key constraints
ALTER TABLE public.exams 
ADD CONSTRAINT fk_exams_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;

ALTER TABLE public.questions 
ADD CONSTRAINT fk_questions_exam_id 
FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

ALTER TABLE public.submissions 
ADD CONSTRAINT fk_submissions_exam_id 
FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_submissions_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.responses 
ADD CONSTRAINT fk_responses_question_id 
FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_responses_submission_id 
FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

-- 8. Enable Row Level Security
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for teachers
CREATE POLICY "Teachers can view their own profile"
ON public.teachers FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Teachers can update their own profile"
ON public.teachers FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- 10. Create RLS policies for exams
CREATE POLICY "Teachers can manage their own exams"
ON public.exams FOR ALL
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- 11. Create RLS policies for questions
CREATE POLICY "Teachers can manage questions for their exams"
ON public.questions FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.exams 
  WHERE exams.id = questions.exam_id 
  AND exams.teacher_id = auth.uid()
));

-- 12. Create RLS policies for students
CREATE POLICY "Students can be created and viewed"
ON public.students FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Students can be inserted"
ON public.students FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 13. Create RLS policies for submissions
CREATE POLICY "Teachers can view submissions for their exams"
ON public.submissions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.exams 
  WHERE exams.id = submissions.exam_id 
  AND exams.teacher_id = auth.uid()
));

CREATE POLICY "Submissions can be inserted"
ON public.submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 14. Create RLS policies for responses
CREATE POLICY "Teachers can view responses for their exam submissions"
ON public.responses FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.submissions s
  JOIN public.exams e ON s.exam_id = e.id
  WHERE s.id = responses.submission_id 
  AND e.teacher_id = auth.uid()
));

CREATE POLICY "Responses can be inserted"
ON public.responses FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 15. Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers for timestamp updates
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();