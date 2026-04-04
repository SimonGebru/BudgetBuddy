import {
  LayoutDashboard,
  Settings,
  Home,
  Users,
  WalletCards,
  Receipt,
} from "lucide-react";

export function getNavItems(hasHousehold) {
  const items = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/household", label: "Household", icon: Users },
    { path: "/my-budget", label: "My Budget", icon: WalletCards },
    { path: "/transactions", label: "Transactions", icon: Receipt },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  if (hasHousehold) {
    items.splice(2, 0, {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    });
  }

  return items;
}