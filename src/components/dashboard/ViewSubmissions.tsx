
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ViewSubmissionsProps {
  exams: any[];
}

export function ViewSubmissions({ exams }: ViewSubmissionsProps) {
  const [selectedExam, setSelectedExam] = useState("");
  
  // Mock submission data
  const submissions = [
    {
      id: 1,
      studentName: "Alice Johnson",
      rollNumber: "CS2021001",
      email: "alice@university.edu",
      score: 85,
      totalQuestions: 10,
      timeTaken: "15:30",
      submittedAt: "2024-01-16 10:30 AM",
      answers: [
        { question: "What is a binary tree?", selected: "A tree with at most two children", correct: "A tree with at most two children", topic: "Trees", isCorrect: true },
        { question: "Time complexity of binary search?", selected: "O(n)", correct: "O(log n)", topic: "Algorithms", isCorrect: false }
      ]
    },
    {
      id: 2,
      studentName: "Bob Smith",
      rollNumber: "CS2021002",
      email: "bob@university.edu",
      score: 70,
      totalQuestions: 10,
      timeTaken: "18:45",
      submittedAt: "2024-01-16 11:15 AM",
      answers: [
        { question: "What is a binary tree?", selected: "A tree with at most two children", correct: "A tree with at most two children", topic: "Trees", isCorrect: true },
        { question: "Time complexity of binary search?", selected: "O(log n)", correct: "O(log n)", topic: "Algorithms", isCorrect: true }
      ]
    }
  ];

  const exportToCSV = () => {
    if (!selectedExam) {
      toast({
        title: "No Exam Selected",
        description: "Please select an exam to export submissions.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = [
      "Student Name",
      "Roll Number", 
      "Email",
      "Score",
      "Total Questions",
      "Percentage",
      "Time Taken",
      "Submitted At"
    ];

    const csvContent = [
      headers.join(","),
      ...submissions.map(sub => [
        sub.studentName,
        sub.rollNumber,
        sub.email,
        sub.score,
        sub.totalQuestions,
        `${((sub.score / sub.totalQuestions) * 100).toFixed(1)}%`,
        sub.timeTaken,
        sub.submittedAt
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-submissions-${selectedExam}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Submissions exported to CSV file."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Submissions</h2>
        <Button onClick={exportToCSV} disabled={!selectedExam}>
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
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id.toString()}>
                  {exam.name} - {exam.topic} ({exam.submissions} submissions)
                </SelectItem>
              ))}
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
                <div className="text-2xl font-bold">{submissions.length}</div>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {(submissions.reduce((sum, sub) => sum + ((sub.score / sub.totalQuestions) * 100), 0) / submissions.length).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Average Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {Math.max(...submissions.map(sub => (sub.score / sub.totalQuestions) * 100)).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Highest Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {Math.min(...submissions.map(sub => (sub.score / sub.totalQuestions) * 100)).toFixed(1)}%
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
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.studentName}</div>
                          <div className="text-sm text-gray-600">{submission.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{submission.rollNumber}</TableCell>
                      <TableCell>
                        <Badge variant={submission.score >= 8 ? "default" : submission.score >= 6 ? "secondary" : "destructive"}>
                          {submission.score}/{submission.totalQuestions}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {((submission.score / submission.totalQuestions) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{submission.timeTaken}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.submittedAt}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
