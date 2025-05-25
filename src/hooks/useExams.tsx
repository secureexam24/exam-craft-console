
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

    console.log('Creating exam with data:', examData);

    // Create exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        teacher_id: user.id,
        name: examData.name,
        topic: examData.topic,
        access_code: examData.accessCode,
        status: 'active',
        // Note: We'll need to add duration_minutes column to the database
      })
      .select()
      .single();

    if (examError) {
      console.error('Exam creation error:', examError);
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
      return;
    }

    console.log('Exam created successfully:', exam);

    // Create questions
    const questionsToInsert = examData.questions.map((q, index) => ({
      exam_id: exam.id,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correctAnswer,
      topic_tag: q.topicTag,
      question_order: index + 1,
    }));

    console.log('Inserting questions:', questionsToInsert);

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('Questions creation error:', questionsError);
      toast({
        title: "Error",
        description: "Failed to create questions",
        variant: "destructive"
      });
      return;
    }

    console.log('Questions created successfully:', insertedQuestions);

    toast({
      title: "Success",
      description: "Exam created successfully with all questions",
    });

    fetchExams();
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
