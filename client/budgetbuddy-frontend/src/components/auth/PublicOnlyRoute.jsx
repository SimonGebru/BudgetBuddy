import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 gradient-warm">
        <div className="card-elevated p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.householdId ? "/dashboard" : "/onboarding"} replace />;
  }

  return children;
}