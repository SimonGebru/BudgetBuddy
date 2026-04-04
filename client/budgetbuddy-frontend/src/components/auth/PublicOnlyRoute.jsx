import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  // Väntar in auth-kollen innan vi bestämmer om sidan ska visas eller inte.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 gradient-warm">
        <div className="card-elevated p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Om användaren redan är inloggad ska den inte kunna gå tillbaka till t.ex. login eller signup.
  // Har användaren household skickas den till dashboarden, annars till sin privata budget.
  if (isAuthenticated) {
    return <Navigate to={user?.householdId ? "/dashboard" : "/my-budget"} replace />;
  }

  return children;
}