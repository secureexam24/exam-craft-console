import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

type Exam = Database['public']['Tables']['exams']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

export function useExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive"
      });
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, [user]);

  const createExam = async (examData: {
    name: string;
    topic: string;
    accessCode: string;
    durationMinutes: number;
    questions: Array<{
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      topicTag: string;
    }>;
  }) => {
    if (!user) return;

    try {
      // First, validate that all correct answers are valid
      const validAnswers = ['A', 'B', 'C', 'D'];
      const invalidQuestions = examData.questions.filter(
        q => !validAnswers.includes(q.correctAnswer)
      );

      if (invalidQuestions.length > 0) {
        toast({
          title: "Invalid Questions",
          description: "All correct answers must be either A, B, C, or D",
          variant: "destructive"
        });
        return;
      }

      // Create exam
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          teacher_id: user.id,
          name: examData.name,
          topic: examData.topic,
          access_code: examData.accessCode,
          status: 'active'
        })
        .select()
        .single();

      if (examError) {
        throw examError;
      }

      // Create questions - convert correct answers to lowercase to match database constraint
      const questionsToInsert = examData.questions.map((q, index) => ({
        exam_id: exam.id,
        question_text: q.questionText,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_answer: q.correctAnswer.toLowerCase(), // Convert to lowercase here
        topic_tag: q.topicTag,
        question_order: index + 1
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        // If questions fail to insert, delete the exam to maintain consistency
        await supabase.from('exams').delete().eq('id', exam.id);
        throw questionsError;
      }

      toast({
        title: "Success",
        description: "Exam created successfully with all questions",
      });

      fetchExams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive"
      });
    }
  };

  const updateExam = async (examId: string, updates: Partial<Exam>) => {
    const { error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', examId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Exam updated successfully",
      });
      fetchExams();
    }
  };

  const deleteExam = async (examId: string) => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
      fetchExams();
    }
  };

  return {
    exams,
    loading,
    createExam,
    updateExam,
    deleteExam,
    refetch: fetchExams,
  };
}