
import { useState } from "react";
import { AuthPage } from "@/components/auth/AuthPage";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacher, setTeacher] = useState(null);

  const handleLogin = (teacherData: any) => {
    setTeacher(teacherData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setTeacher(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isAuthenticated ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <TeacherDashboard teacher={teacher} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
