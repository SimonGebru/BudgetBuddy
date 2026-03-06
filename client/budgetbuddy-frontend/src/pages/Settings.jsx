import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Settings as SettingsIcon, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { logout } from '@/services/api';
import { mockCurrentUser } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'See you next time!',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 lg:max-w-2xl">
        {/* Header */}
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>

        {/* Profile Card */}
        <div className="card-elevated p-6 lg:p-8">
          <div className="flex items-center gap-4 lg:gap-6 mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                {mockCurrentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-foreground">{mockCurrentUser.name}</h2>
              <p className="text-sm lg:text-base text-muted-foreground">{mockCurrentUser.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{mockCurrentUser.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{mockCurrentUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Preferences</h3>
          
          <button
            disabled
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60 cursor-not-allowed"
          >
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Default Split Mode</p>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </Button>
      </div>
    </AppLayout>
  );
}