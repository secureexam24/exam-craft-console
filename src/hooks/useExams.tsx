
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
    questions: any[];
  }) => {
    if (!user) return;

    // Create exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        teacher_id: user.id,
        name: examData.name,
        topic: examData.topic,
        access_code: examData.accessCode,
        status: 'active',
      })
      .select()
      .single();

    if (examError) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
      return;
    }

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

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) {
      toast({
        title: "Error",
        description: "Failed to create questions",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Exam created successfully",
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
