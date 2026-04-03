import {
  LayoutDashboard,
  Settings,
  Home,
  Users,
  WalletCards,
  Receipt,
} from "lucide-react";

export const navItems = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/household", label: "Household", icon: Users },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/my-budget", label: "My Budget", icon: WalletCards },
  { path: "/transactions", label: "Transactions", icon: Receipt },
  { path: "/settings", label: "Settings", icon: Settings },
];