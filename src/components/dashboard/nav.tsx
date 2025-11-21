'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Wallet,
  Settings,
  LogOut,
  DollarSign,
} from 'lucide-react';

interface NavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/opportunities', label: 'Opportunities', icon: TrendingUp },
    { href: '/dashboard/trades', label: 'Trades', icon: Briefcase },
    { href: '/dashboard/portfolio', label: 'Portfolio', icon: Wallet },
    { href: '/dashboard/fees', label: 'Fees', icon: DollarSign },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-64 border-r bg-card p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Trading Platform</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-8">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
}

