import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Landing page / entry point för applikationen.
// Här kan användaren logga in, skapa konto eller fortsätta till appen.
export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-warm">
      <div className="w-full max-w-sm lg:max-w-lg animate-scale-in">
        
        {/* App branding och kort introduktion */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Wallet className="h-8 w-8 lg:h-10 lg:w-10 text-primary-foreground" />
          </div>

          <h1 className="text-3xl lg:text-5xl font-bold text-foreground text-balance">
            Budget together, <br className="hidden lg:block" />
            stress less
          </h1>

          <p className="text-muted-foreground mt-3 lg:mt-4 text-sm lg:text-lg max-w-md mx-auto text-balance">
            Plan your monthly budget, split costs fairly, and stay on the same page with your partner.
          </p>
        </div>

        {/* Auth actions */}
        <div className="card-elevated p-6 lg:p-8 space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/register">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Link>
          </Button>

          {/* Snabbväg för att gå direkt till appen */}
          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              Continue to app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Kort beskrivning av appens syfte */}
        <p className="text-center text-xs lg:text-sm text-muted-foreground mt-6">
          A simple way to manage shared budgets and household planning.
        </p>
      </div>
    </div>
  );
}