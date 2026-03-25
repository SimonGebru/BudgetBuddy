import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Users, ArrowRight, CheckCircle, Copy, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createHousehold, joinHousehold, getCurrentUser } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

function getCurrentMonth() {
  // Används som defaultvärde när sidan öppnas första gången.
  return new Date().toISOString().slice(0, 7);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const [householdName, setHouseholdName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const [householdId, setHouseholdId] = useState('');
  const [joinIncome, setJoinIncome] = useState('');

  const [createdHouseholdId, setCreatedHouseholdId] = useState('');
  const [successType, setSuccessType] = useState('created');

  const currentMonth = getCurrentMonth();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();

        // Om användaren redan är kopplad till ett hushåll
        // ska onboarding hoppas över och användaren skickas till dashboarden.
        if (user?.householdId) {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        // Om kontrollen misslyckas låter vi användaren stanna kvar på sidan
        // och avslutar loading-statet så att onboarding fortfarande går att använda.
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!householdName || !monthlyIncome) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createHousehold(householdName, Number(monthlyIncome));

      // Sparar household-id så att det kan visas i success-steget efter skapandet.
      setCreatedHouseholdId(result.id);
      setSuccessType('created');
      setStep('success');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create household. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!householdId || !joinIncome) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await joinHousehold(householdId, Number(joinIncome));
      setSuccessType('joined');
      setStep('success');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join household. Check the ID and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyHouseholdId = () => {
    navigator.clipboard.writeText(createdHouseholdId);

    toast({
      title: 'Copied!',
      description: 'Household ID copied to clipboard.',
    });
  };

  // Visas medan vi först kontrollerar om användaren redan tillhör ett hushåll.
  if (isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 gradient-warm">
        <div className="card-elevated p-6 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-warm">
      <div className="w-full max-w-sm lg:max-w-lg animate-scale-in">
        {step !== 'success' && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Home className="h-8 w-8 lg:h-10 lg:w-10 text-primary-foreground" />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Set up your household</h1>

            <p className="text-muted-foreground mt-1 lg:text-lg">
              {step === 'choice' && 'Budget together with your partner'}
              {step === 'create' && 'Create a new household'}
              {step === 'join' && 'Join an existing household'}
            </p>
          </div>
        )}

        {step === 'choice' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <button
              onClick={() => setStep('create')}
              className="card-interactive w-full p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Home className="h-6 w-6 lg:h-7 lg:w-7 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground lg:text-lg">Create Household</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Start fresh and invite your partner
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>

            <button
              onClick={() => setStep('join')}
              className="card-interactive w-full p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 lg:h-7 lg:w-7 text-accent" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground lg:text-lg">Join Household</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Connect with your partner&apos;s household
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          </div>
        )}

        {step === 'create' && (
          <div className="card-elevated p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="input-label">Household Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Alex & Sam"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Your Monthly Income (SEK)</label>
                <Input
                  type="number"
                  placeholder="e.g., 40000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  min={0}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('choice')}
                >
                  Back
                </Button>

                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'join' && (
          <div className="card-elevated p-6">
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="input-label">Household ID</label>
                <Input
                  type="text"
                  placeholder="Enter the ID from your partner"
                  value={householdId}
                  onChange={(e) => setHouseholdId(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Your Monthly Income (SEK)</label>
                <Input
                  type="number"
                  placeholder="e.g., 35000"
                  value={joinIncome}
                  onChange={(e) => setJoinIncome(e.target.value)}
                  min={0}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('choice')}
                >
                  Back
                </Button>

                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {successType === 'created' ? 'Household Created!' : 'Welcome to the Household!'}
            </h1>

            <p className="text-muted-foreground lg:text-lg mb-8">
              {successType === 'created'
                ? "You're all set! Share your household ID with your partner so they can join."
                : "You've successfully joined the household. You can now budget together!"}
            </p>

            {/* Om hushållet skapades visas id:t så att det enkelt kan delas med partnern */}
            {successType === 'created' && (
              <div className="card-elevated p-4 mb-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">Your Household ID</p>
                <div className="flex items-center justify-between gap-3 bg-muted rounded-lg p-3">
                  <code className="text-sm font-mono text-foreground">{createdHouseholdId}</code>
                  <Button variant="ghost" size="icon" onClick={copyHouseholdId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this with your partner to let them join
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link to={`/budget/${currentMonth}/edit`}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}