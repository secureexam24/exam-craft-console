
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Users, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ExamListProps {
  exams: any[];
  setExams: (exams: any[]) => void;
}

export function ExamList({ exams, setExams }: ExamListProps) {
  const toggleExamStatus = (examId: number) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? { ...exam, isActive: !exam.isActive }
        : exam
    ));
    toast({
      title: "Exam Status Updated",
      description: "The exam status has been successfully changed."
    });
  };

  const deleteExam = (examId: number) => {
    setExams(exams.filter(exam => exam.id !== examId));
    toast({
      title: "Exam Deleted",
      description: "The exam has been permanently deleted."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Exams</h2>
        <p className="text-gray-600">{exams.length} total exams</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                  <CardDescription>{exam.topic}</CardDescription>
                </div>
                <Badge variant={exam.isActive ? "default" : "secondary"}>
                  {exam.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Code: {exam.accessCode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{exam.submissions} submissions</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>{exam.questions} questions</p>
                <p>Created: {exam.createdAt}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exam.isActive}
                    onCheckedChange={() => toggleExamStatus(exam.id)}
                  />
                  <span className="text-sm">Active</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteExam(exam.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {exams.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No Exams Created Yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first exam</p>
            <Button>Create Your First Exam</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
