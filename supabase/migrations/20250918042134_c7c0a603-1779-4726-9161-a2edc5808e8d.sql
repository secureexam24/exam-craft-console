-- Recreate the complete exam system schema with proper security

-- 1. Create custom types
CREATE TYPE public.exam_status AS ENUM ('active', 'inactive');
CREATE TYPE public.teacher_status AS ENUM ('active', 'inactive', 'pending');

-- 2. Create teachers table
CREATE TABLE public.teachers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL DEFAULT '',
    name character varying(255) NOT NULL,
    college_name character varying(255) NOT NULL,
    department character varying(255),
    phone character varying(20),
    status public.teacher_status DEFAULT 'active',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 3. Create exams table 
CREATE TABLE public.exams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    topic character varying(255) NOT NULL,
    access_code character varying(50) NOT NULL,
    status public.exam_status DEFAULT 'active',
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration_minutes integer DEFAULT 60,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 4. Create questions table
CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exam_id uuid NOT NULL,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_answer character(1) NOT NULL,
    topic_tag character varying(255) NOT NULL,
    question_order integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 5. Create students table
CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    roll_number character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 6. Create submissions table
CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exam_id uuid NOT NULL,
    student_id uuid NOT NULL,
    total_score integer DEFAULT 0 NOT NULL,
    total_questions integer NOT NULL,
    time_taken_minutes integer,
    submitted_at timestamp with time zone DEFAULT NOW()
);

-- 7. Create responses table
CREATE TABLE public.responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_answer character(1),
    correct_answer character(1),
    is_correct boolean NOT NULL,
    time_taken_seconds integer,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 8. Add primary key constraints
ALTER TABLE public.teachers ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);
ALTER TABLE public.exams ADD CONSTRAINT exams_pkey PRIMARY KEY (id);
ALTER TABLE public.questions ADD CONSTRAINT questions_pkey PRIMARY KEY (id);
ALTER TABLE public.students ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE public.submissions ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);
ALTER TABLE public.responses ADD CONSTRAINT responses_pkey PRIMARY KEY (id);

-- 9. Add unique constraints
ALTER TABLE public.teachers ADD CONSTRAINT teachers_email_key UNIQUE (email);
ALTER TABLE public.exams ADD CONSTRAINT exams_access_code_key UNIQUE (access_code);
ALTER TABLE public.students ADD CONSTRAINT students_roll_number_email_key UNIQUE (roll_number, email);
ALTER TABLE public.questions ADD CONSTRAINT questions_exam_id_question_order_key UNIQUE (exam_id, question_order);
ALTER TABLE public.submissions ADD CONSTRAINT submissions_exam_id_student_id_key UNIQUE (exam_id, student_id);
ALTER TABLE public.responses ADD CONSTRAINT responses_submission_id_question_id_key UNIQUE (submission_id, question_id);

-- 10. Add foreign key constraints
ALTER TABLE public.exams 
ADD CONSTRAINT exams_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;

ALTER TABLE public.questions 
ADD CONSTRAINT questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE,
ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.responses 
ADD CONSTRAINT responses_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE,
ADD CONSTRAINT responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

-- 11. Add check constraints
ALTER TABLE public.questions 
ADD CONSTRAINT questions_correct_answer_check CHECK (correct_answer = ANY (ARRAY['a','b','c','d']));

ALTER TABLE public.responses 
ADD CONSTRAINT responses_selected_answer_check CHECK (
    (selected_answer IS NULL) OR 
    (selected_answer = ANY (ARRAY['a','b','c','d','n']))
);

-- 12. Enable Row Level Security on all tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- 13. Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_teacher_from_exam(exam_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT teacher_id FROM public.exams WHERE id = exam_id;
$$;

CREATE OR REPLACE FUNCTION public.get_teacher_from_submission(submission_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT e.teacher_id 
  FROM public.submissions s 
  JOIN public.exams e ON s.exam_id = e.id 
  WHERE s.id = submission_id;
$$;

-- 14. Create comprehensive RLS policies

-- Teachers table policies
CREATE POLICY "Teachers can view their own profile"
ON public.teachers FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Teachers can update their own profile"
ON public.teachers FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Allow teacher registration"
ON public.teachers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Exams table policies
CREATE POLICY "Teachers can manage their own exams"
ON public.exams FOR ALL
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Public can view active exams for taking"
ON public.exams FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Questions table policies
CREATE POLICY "Teachers can manage questions for their exams"
ON public.questions FOR ALL
TO authenticated
USING (public.get_teacher_from_exam(exam_id) = auth.uid());

CREATE POLICY "Public can view questions for active exams"
ON public.questions FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.exams 
  WHERE exams.id = questions.exam_id 
  AND exams.status = 'active'
));

-- Students table policies
CREATE POLICY "Students can be created during exam submission"
ON public.students FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Teachers can view students who took their exams"
ON public.students FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.exams e ON s.exam_id = e.id
    WHERE s.student_id = students.id
    AND e.teacher_id = auth.uid()
  )
);

CREATE POLICY "Public read access for students"
ON public.students FOR SELECT
TO anon, authenticated
USING (true);

-- Submissions table policies
CREATE POLICY "Teachers can view submissions for their exams"
ON public.submissions FOR SELECT
TO authenticated
USING (public.get_teacher_from_exam(exam_id) = auth.uid());

CREATE POLICY "Students can submit to exams"
ON public.submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow submission updates"
ON public.submissions FOR UPDATE
TO anon, authenticated
USING (true);

-- Responses table policies
CREATE POLICY "Teachers can view responses for their exam submissions"
ON public.responses FOR SELECT
TO authenticated
USING (public.get_teacher_from_submission(submission_id) = auth.uid());

CREATE POLICY "Students can submit responses"
ON public.responses FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow response updates"
ON public.responses FOR UPDATE
TO anon, authenticated
USING (true);

-- 15. Create update timestamp function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Create indexes for better performance
CREATE INDEX idx_exams_teacher_id ON public.exams(teacher_id);
CREATE INDEX idx_exams_access_code ON public.exams(access_code);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_submissions_exam_id ON public.submissions(exam_id);
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_responses_submission_id ON public.responses(submission_id);
CREATE INDEX idx_responses_question_id ON public.responses(question_id);

-- 17. Add data validation constraints
ALTER TABLE public.exams 
ADD CONSTRAINT check_exam_name_length CHECK (length(name) >= 3 AND length(name) <= 255),
ADD CONSTRAINT check_topic_length CHECK (length(topic) >= 2 AND length(topic) <= 255),
ADD CONSTRAINT check_access_code_format CHECK (access_code ~ '^[A-Z0-9]{6,50}$');

ALTER TABLE public.questions
ADD CONSTRAINT check_question_text_length CHECK (length(question_text) >= 10),
ADD CONSTRAINT check_options_not_empty CHECK (
  length(option_a) > 0 AND 
  length(option_b) > 0 AND 
  length(option_c) > 0 AND 
  length(option_d) > 0
);

ALTER TABLE public.students
ADD CONSTRAINT check_student_name_length CHECK (length(name) >= 2 AND length(name) <= 255),
ADD CONSTRAINT check_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_roll_number_format CHECK (length(roll_number) >= 1 AND length(roll_number) <= 100);

ALTER TABLE public.teachers
ADD CONSTRAINT check_teacher_name_length CHECK (length(name) >= 2 AND length(name) <= 255),
ADD CONSTRAINT check_teacher_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_college_name_length CHECK (length(college_name) >= 2 AND length(college_name) <= 255);