import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useAuth();

  // Medan auth-status laddas (t.ex. när token verifieras)
  // visar vi en enkel loading-vy istället för att rendera sidan direkt.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 gradient-warm">
        <div className="card-elevated p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Om användaren inte är autentiserad skickas den till login.
  // location sparas i state så att vi senare kan navigera tillbaka
  // till sidan användaren försökte nå.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Om användaren är inloggad renderas innehållet som ligger i routen.
  return children;
}