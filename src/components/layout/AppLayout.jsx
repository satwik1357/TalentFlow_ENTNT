import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  ClipboardList,
  Search,
  Bell,
  User,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  Rocket,
  Zap,
  Workflow,
  GitBranch,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Navigation items
const navigation = [
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Assessments', href: '/assessments', icon: ClipboardList },
];

/**
 * AppLayout Component
 *
 * Main layout component providing sidebar navigation, header, and content area.
 * Uses React Router for navigation and includes responsive design.
 */
export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-gray-200 bg-white/95 backdrop-blur-lg shadow-lg md:block">
        <div className="flex h-20 items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3 font-bold text-2xl">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Workflow className="h-8 w-8 text-sky-600" />
            </div>
            <span className="bg-gradient-to-r black from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              TalentFlow
            </span>
          </div>
        </div>
        <div className="px-4 py-6">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 transition-colors" />
                  {item.name}
                  {isActive && <div className="ml-auto h-2 w-2 bg-blue-600 rounded-full"></div>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-gray-200">
              <AvatarImage src="/avatars/01.png" alt="User avatar" />
              <AvatarFallback className="bg-blue-100 text-blue-700">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">User Name</p>
              <p className="truncate text-xs text-gray-500">user@example.com</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {navigation.find((item) => location.pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 hover:bg-gray-100">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/avatars/01.png" alt="User avatar" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">A</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">Admin</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
