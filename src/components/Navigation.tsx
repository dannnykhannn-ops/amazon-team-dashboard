import React from 'react';
import { LogOut, Menu, X, BarChart3, Users, CheckSquare, Settings } from 'lucide-react';
import { signOut } from '../lib/auth';
import { User } from '../lib/supabase';

type NavigationProps = {
  user: User;
  currentPage: string;
  onPageChange: (page: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Navigation({
  user,
  currentPage,
  onPageChange,
  sidebarOpen,
  onToggleSidebar,
}: NavigationProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    ...(isAdmin || isManager ? [{ id: 'employees', label: 'Employees', icon: Users }] : []),
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">TaskHub</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 z-30 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onPageChange(id);
                if (window.innerWidth < 1024) {
                  onToggleSidebar();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden top-16"
          onClick={onToggleSidebar}
        />
      )}
    </>
  );
}
