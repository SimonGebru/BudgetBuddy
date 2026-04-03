import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import InstallPromptModal from '@/components/pwa/InstallPromptModal';

// Landing page / entry point för applikationen.
// Här kan användaren logga in, skapa konto eller installera appen.
export default function Index() {
  const { canInstall, install, isIos, isInStandaloneMode } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('Budgify-install-dismissed');

    // Visa inte popupen om appen redan är installerad
    if (isInStandaloneMode) return;

    // Visa inte popupen igen om användaren redan stängt den
    if (dismissed === 'true') return;

    // Visa popup om riktig installation är möjlig eller om användaren kör iPhone
    if (canInstall || isIos) {
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isIos, isInStandaloneMode]);

  const handleCloseInstallModal = () => {
    localStorage.setItem('Budgify-install-dismissed', 'true');
    setShowInstallModal(false);
  };

  const handleInstall = async () => {
    await install();
    localStorage.setItem('Budgify-install-dismissed', 'true');
    setShowInstallModal(false);
  };

  return (
    <>
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
          </div>

          {/* Kort beskrivning av appens syfte */}
          <p className="text-center text-xs lg:text-sm text-muted-foreground mt-6">
            A simple way to manage shared budgets and household planning.
          </p>
        </div>
      </div>

      <InstallPromptModal
        open={showInstallModal}
        onClose={handleCloseInstallModal}
        onInstall={handleInstall}
        canInstall={canInstall}
        isIos={isIos}
      />
    </>
  );
}