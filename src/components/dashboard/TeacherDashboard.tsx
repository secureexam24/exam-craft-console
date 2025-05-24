
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Plus, BookOpen, Users, BarChart3 } from "lucide-react";
import { ExamList } from "./ExamList";
import { CreateExam } from "./CreateExam";
import { ViewSubmissions } from "./ViewSubmissions";

interface TeacherDashboardProps {
  teacher: any;
  onLogout: () => void;
}

export function TeacherDashboard({ teacher, onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState("exams");
  const [exams, setExams] = useState([
    {
      id: 1,
      name: "Data Structures Quiz",
      topic: "Binary Trees",
      accessCode: "DS2024",
      questions: 10,
      isActive: true,
      submissions: 25,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Algorithm Analysis",
      topic: "Time Complexity",
      accessCode: "ALG2024",
      questions: 15,
      isActive: false,
      submissions: 18,
      createdAt: "2024-01-10"
    }
  ]);

  const handleCreateExam = (examData: any) => {
    const newExam = {
      id: exams.length + 1,
      ...examData,
      submissions: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setExams([...exams, newExam]);
    setActiveTab("exams");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Teacher Console</h1>
                <p className="text-sm text-gray-600">Welcome, {teacher.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
              <p className="text-xs text-muted-foreground">
                {exams.filter(e => e.isActive).length} active exams
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams.reduce((sum, exam) => sum + exam.submissions, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all exams
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.5%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("exams")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "exams"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Exams
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Create Exam
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "submissions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              View Submissions
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "exams" && (
          <ExamList exams={exams} setExams={setExams} />
        )}
        {activeTab === "create" && (
          <CreateExam onCreateExam={handleCreateExam} />
        )}
        {activeTab === "submissions" && (
          <ViewSubmissions exams={exams} />
        )}
      </div>
    </div>
  );
}
