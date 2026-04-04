import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicOnlyRoute from "@/components/auth/PublicOnlyRoute";
import HouseholdRoute from "@/components/auth/HouseholdRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Household from "@/pages/Household";
import Dashboard from "./pages/Dashboard";
import MyBudget from "./pages/MyBudget";
import EditBudget from "./pages/EditBudget";
import EditMyBudget from "./pages/EditMyBudget";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";

// Skapar en gemensam QueryClient för hela appen.
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        {/* Toast-komponenter gör att notifieringar kan visas globalt i hela appen */}
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Publik startsida */}
            <Route path="/" element={<Index />} />

            {/* Dessa routes ska bara vara tillgängliga för användare som inte redan är inloggade */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            {/* Dessa routes kräver att användaren är autentiserad */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/household"
              element={
                <ProtectedRoute>
                  <Household />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <HouseholdRoute>
                  <Dashboard />
                </HouseholdRoute>
              }
            />

            <Route
              path="/my-budget"
              element={
                <ProtectedRoute>
                  <MyBudget />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-budget/:month/edit"
              element={
                <ProtectedRoute>
                  <EditMyBudget />
                </ProtectedRoute>
              }
            />

            <Route
              path="/budget/:month/edit"
              element={
                <ProtectedRoute>
                  <EditBudget />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback-route för sidor som inte finns */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
