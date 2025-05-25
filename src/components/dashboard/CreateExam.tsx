
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  topicTag: string;
}

interface CreateExamProps {
  onCreateExam: (examData: any) => void;
}

export function CreateExam({ onCreateExam }: CreateExamProps) {
  const [examData, setExamData] = useState({
    name: "",
    topic: "",
    accessCode: "",
    durationMinutes: 60, // Default 60 minutes
    isActive: true
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      topicTag: ""
    }
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      topicTag: ""
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examData.name || !examData.topic || !examData.accessCode || !examData.durationMinutes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all exam details including duration.",
        variant: "destructive"
      });
      return;
    }

    const incompleteQuestions = questions.some(q => 
      !q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.topicTag
    );

    if (incompleteQuestions) {
      toast({
        title: "Incomplete Questions",
        description: "Please complete all questions and their options.",
        variant: "destructive"
      });
      return;
    }

    // Pass the complete exam data with questions
    onCreateExam({
      ...examData,
      questions: questions.map(q => ({
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        topicTag: q.topicTag
      }))
    });

    toast({
      title: "Exam Created Successfully",
      description: `${examData.name} has been created with ${questions.length} questions.`
    });

    // Reset form
    setExamData({ name: "", topic: "", accessCode: "", durationMinutes: 60, isActive: true });
    setQuestions([{
      id: 1,
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      topicTag: ""
    }]);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
          <CardDescription>
            Set up your exam details and add MCQ questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exam Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Input
                  id="examName"
                  placeholder="e.g., Data Structures Quiz"
                  value={examData.name}
                  onChange={(e) => setExamData({ ...examData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Binary Trees"
                  value={examData.topic}
                  onChange={(e) => setExamData({ ...examData, topic: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  placeholder="e.g., DS2024"
                  value={examData.accessCode}
                  onChange={(e) => setExamData({ ...examData, accessCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="60"
                  value={examData.durationMinutes}
                  onChange={(e) => setExamData({ ...examData, durationMinutes: parseInt(e.target.value) || 60 })}
                  required
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                <Button type="button" onClick={addQuestion} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, questionIndex) => (
                <Card key={question.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Question {questionIndex + 1}</h4>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                          placeholder="Enter your question here..."
                          value={question.questionText}
                          onChange={(e) => updateQuestion(question.id, "questionText", e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Topic Tag</Label>
                        <Input
                          placeholder="Internal topic tag"
                          value={question.topicTag}
                          onChange={(e) => updateQuestion(question.id, "topicTag", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Answer Options</Label>
                      <RadioGroup
                        value={question.correctAnswer}
                        onValueChange={(value) => updateQuestion(question.id, "correctAnswer", value)}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="A"
                            id={`q${question.id}-optionA`}
                          />
                          <Input
                            placeholder="Option A"
                            value={question.optionA}
                            onChange={(e) => updateQuestion(question.id, "optionA", e.target.value)}
                            className="flex-1"
                          />
                          <Label
                            htmlFor={`q${question.id}-optionA`}
                            className="text-sm text-gray-500"
                          >
                            {question.correctAnswer === "A" && "✓ Correct"}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="B"
                            id={`q${question.id}-optionB`}
                          />
                          <Input
                            placeholder="Option B"
                            value={question.optionB}
                            onChange={(e) => updateQuestion(question.id, "optionB", e.target.value)}
                            className="flex-1"
                          />
                          <Label
                            htmlFor={`q${question.id}-optionB`}
                            className="text-sm text-gray-500"
                          >
                            {question.correctAnswer === "B" && "✓ Correct"}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="C"
                            id={`q${question.id}-optionC`}
                          />
                          <Input
                            placeholder="Option C"
                            value={question.optionC}
                            onChange={(e) => updateQuestion(question.id, "optionC", e.target.value)}
                            className="flex-1"
                          />
                          <Label
                            htmlFor={`q${question.id}-optionC`}
                            className="text-sm text-gray-500"
                          >
                            {question.correctAnswer === "C" && "✓ Correct"}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="D"
                            id={`q${question.id}-optionD`}
                          />
                          <Input
                            placeholder="Option D"
                            value={question.optionD}
                            onChange={(e) => updateQuestion(question.id, "optionD", e.target.value)}
                            className="flex-1"
                          />
                          <Label
                            htmlFor={`q${question.id}-optionD`}
                            className="text-sm text-gray-500"
                          >
                            {question.correctAnswer === "D" && "✓ Correct"}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="submit" className="px-8">
                <Save className="w-4 h-4 mr-2" />
                Create Exam
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
