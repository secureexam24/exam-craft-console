
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";

const Index = () => {
  const { user, teacher, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!user || !teacher ? (
        <AuthPage />
      ) : (
        <TeacherDashboard teacher={teacher} onLogout={signOut} />
      )}
    </div>
  );
};

export default Index;
