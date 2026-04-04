import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Home,
  Users,
  WalletCards,
  Receipt,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const hasHousehold = !!user?.householdId;

  const primaryNavItems = hasHousehold
    ? [
        { path: "/home", label: "Home", icon: Home },
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/my-budget", label: "My Budget", icon: WalletCards },
      ]
    : [
        { path: "/home", label: "Home", icon: Home },
        { path: "/my-budget", label: "My Budget", icon: WalletCards },
        { path: "/transactions", label: "Transactions", icon: Receipt },
      ];

  const secondaryNavItems = hasHousehold
    ? [
        { path: "/household", label: "Household", icon: Users },
        { path: "/transactions", label: "Transactions", icon: Receipt },
        { path: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { path: "/household", label: "Household", icon: Users },
        { path: "/settings", label: "Settings", icon: Settings },
      ];

  const isMoreActive = secondaryNavItems.some(({ path }) =>
    location.pathname.startsWith(path)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="max-w-lg mx-auto grid grid-cols-4 items-center py-2">
        {primaryNavItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[11px] font-medium text-center leading-tight">
                {label}
              </span>
            </Link>
          );
        })}

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200",
                isMoreActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal
                className={cn("h-5 w-5", isMoreActive && "stroke-[2.5]")}
              />
              <span className="text-[11px] font-medium text-center leading-tight">
                More
              </span>
            </button>
          </SheetTrigger>

          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="text-left">
              <SheetTitle>More</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {secondaryNavItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname.startsWith(path);

                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-4 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}