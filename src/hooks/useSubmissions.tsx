
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type Submission = Database['public']['Tables']['submissions']['Row'] & {
  student: Database['public']['Tables']['students']['Row'];
  exam: Database['public']['Tables']['exams']['Row'];
};

type Response = Database['public']['Tables']['responses']['Row'] & {
  question: Database['public']['Tables']['questions']['Row'];
};

export function useSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        student:students(*),
        exam:exams!inner(*)
      `)
      .eq('exam.teacher_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const fetchSubmissionResponses = async (submissionId: string): Promise<Response[]> => {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        question:questions(*)
      `)
      .eq('submission_id', submissionId);

    if (error) {
      console.error('Error fetching responses:', error);
      return [];
    }

    return data || [];
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const exportSubmissions = async (examId?: string) => {
    let submissionsToExport = submissions;
    
    if (examId) {
      submissionsToExport = submissions.filter(s => s.exam_id === examId);
    }

    const csvData = [];
    csvData.push([
      'Student Name',
      'Roll Number',
      'Email',
      'Exam Name',
      'Topic',
      'Score',
      'Total Questions',
      'Time Taken (minutes)',
      'Submitted At'
    ]);

    for (const submission of submissionsToExport) {
      csvData.push([
        submission.student.name,
        submission.student.roll_number,
        submission.student.email,
        submission.exam.name,
        submission.exam.topic,
        submission.total_score.toString(),
        submission.total_questions.toString(),
        submission.time_taken_minutes?.toString() || 'N/A',
        new Date(submission.submitted_at || '').toLocaleString()
      ]);
    }

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    submissions,
    loading,
    fetchSubmissionResponses,
    exportSubmissions,
    refetch: fetchSubmissions,
  };
}
