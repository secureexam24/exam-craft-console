
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSubmissions } from "@/hooks/useSubmissions";

interface ViewSubmissionsProps {
  exams: any[];
}

export function ViewSubmissions({ exams }: ViewSubmissionsProps) {
  const [selectedExam, setSelectedExam] = useState("");
  const { submissions, loading, exportSubmissions } = useSubmissions();

  // Filter submissions for the selected exam
  const filteredSubmissions = selectedExam 
    ? submissions.filter(submission => submission.exam_id === selectedExam)
    : [];

  const handleExportCSV = () => {
    if (!selectedExam) {
      toast({
        title: "No Exam Selected",
        description: "Please select an exam to export submissions.",
        variant: "destructive"
      });
      return;
    }

    exportSubmissions(selectedExam);
    toast({
      title: "Export Successful",
      description: "Submissions exported to CSV file."
    });
  };

  const calculateStats = () => {
    if (filteredSubmissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = filteredSubmissions.map(sub => (sub.total_score / sub.total_questions) * 100);
    
    return {
      totalSubmissions: filteredSubmissions.length,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Submissions</h2>
        <Button onClick={handleExportCSV} disabled={!selectedExam || filteredSubmissions.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>
            Choose an exam to view student submissions and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exam to view submissions" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => {
                const examSubmissions = submissions.filter(s => s.exam_id === exam.id);
                return (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} - {exam.topic} ({examSubmissions.length} submissions)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExam && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.averageScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Average Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.highestScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Highest Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.lowestScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Lowest Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Submissions</CardTitle>
              <CardDescription>
                Detailed view of each student's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No submissions found for this exam.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => {
                      const percentage = (submission.total_score / submission.total_questions) * 100;
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{submission.student.name}</div>
                              <div className="text-sm text-gray-600">{submission.student.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{submission.student.roll_number}</TableCell>
                          <TableCell>
                            <Badge variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                              {submission.total_score}/{submission.total_questions}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {percentage.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{submission.time_taken_minutes || 'N/A'} min</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
