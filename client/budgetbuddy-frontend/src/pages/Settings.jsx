import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Settings as SettingsIcon, Save } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { updateMe } from '@/services/api';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, clearAuth, setUser } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [defaultSplitMode, setDefaultSplitMode] = useState('equal');

  useEffect(() => {
    // Formulärfälten synkas med aktuell användare när sidan laddas
    // eller när user i auth-context uppdateras.
    setName(user?.name || '');
    setEmail(user?.email || '');
    setDefaultSplitMode(user?.defaultSplitMode || 'equal');
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await clearAuth();

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Name and email cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedUser = await updateMe({
        name: name.trim(),
        email: email.trim(),
        defaultSplitMode,
      });

      // Uppdaterar även auth-context direkt så att resten av appen visar senaste användardatan.
      setUser(updatedUser);

      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'No email';

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
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-foreground">{displayName}</h2>
              <p className="text-sm lg:text-base text-muted-foreground">{displayEmail}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="input-label">Name</label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Email</label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSavingProfile}>
              <Save className="h-4 w-4 mr-2" />
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </div>

        {/* Preferences */}
<div className="card-elevated p-6">
  <h3 className="font-semibold text-foreground mb-4">Preferences</h3>

  <div className="space-y-3">
    <label className="input-label">Default Split Mode</label>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => setDefaultSplitMode('income')}
        className={`rounded-lg border p-3 text-left transition ${
          defaultSplitMode === 'income'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-background hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Income</p>
            <p className="text-sm text-muted-foreground">
              Split based on income
            </p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setDefaultSplitMode('equal')}
        className={`rounded-lg border p-3 text-left transition ${
          defaultSplitMode === 'equal'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-background hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">50/50</p>
            <p className="text-sm text-muted-foreground">
              Split equally
            </p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setDefaultSplitMode('topEarnsMore')}
        className={`rounded-lg border p-3 text-left transition ${
          defaultSplitMode === 'topEarnsMore'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-background hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Top +%</p>
            <p className="text-sm text-muted-foreground">
              Higher earner pays more
            </p>
          </div>
        </div>
      </button>
    </div>
  </div>
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