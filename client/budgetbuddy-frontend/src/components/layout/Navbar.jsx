import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Settings, Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/onboarding', label: 'Household', icon: Users },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}