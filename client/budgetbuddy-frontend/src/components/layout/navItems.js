import { LayoutDashboard, Settings, Home, Users, WalletCards } from 'lucide-react';

export const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/household', label: 'Household', icon: Users },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/my-budget', label: 'My Budget', icon: WalletCards },
  { path: '/settings', label: 'Settings', icon: Settings },
];