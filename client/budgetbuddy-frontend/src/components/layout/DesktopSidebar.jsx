import { useLocation, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/components/layout/navItems';

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">BudgetBuddy</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);

            return (
              <li key={path}>
                <Link
                  to={path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Budget together, grow together
        </p>
      </div>
    </aside>
  );
}