"use client";
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Plus, AlertCircle, LayoutDashboard, ListTodo, Calendar, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../firebase/auth';
import { useTasks } from '../../hooks/useTasks';

const NAV_ITEMS = [
  { path: '/', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { path: '/tasks', label: 'Công việc', icon: <ListTodo size={20} /> },
  { path: '/calendar', label: 'Lịch', icon: <Calendar size={20} /> },
  { path: '/settings', label: 'Cài đặt', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { stats } = useTasks();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-parchment-light border-b border-border-light flex items-center justify-between px-6 z-40 shadow-sm">
        <div className="font-heading text-xl font-bold text-ink flex items-center">
          <span className="mr-2">📋</span> Task Manager
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-ink/20 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 h-screen fixed top-0 left-0 bg-parchment-light border-r border-border-light flex flex-col shadow-vintage z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-light font-heading text-xl font-bold text-ink">
          <div className="flex items-center">
            <span className="mr-2">📋</span> Task Manager
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-ink-muted hover:text-ink rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2 px-2">Menu</div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                      isActive 
                        ? 'bg-copper text-white shadow-sm' 
                        : 'text-ink-light hover:bg-parchment-dark hover:text-ink'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
        </div>

        <div>
          <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2 px-2">Nhanh</div>
          <button
            onClick={() => router.push('/tasks/new')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-ink-light hover:bg-parchment-dark hover:text-ink transition-colors font-medium text-left"
          >
            <Plus size={20} />
            Tạo công việc mới
          </button>
        </div>

        {stats.overdue > 0 && (
          <div>
            <div className="text-xs font-bold text-wax-red uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
              <AlertCircle size={14} /> Cảnh báo
            </div>
            <div className="px-3 py-2 rounded-lg bg-wax-red-bg border border-wax-red/20 text-wax-red font-medium text-sm flex items-center gap-2">
              {stats.overdue} công việc quá hạn
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-light bg-parchment flex items-center gap-3">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-border-light shadow-sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-copper text-white flex items-center justify-center font-bold shadow-sm">
            {getInitials(user?.displayName)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-ink truncate">{user?.displayName || 'User'}</div>
          <div className="text-xs text-ink-muted truncate">{user?.email}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-ink-muted hover:text-wax-red hover:bg-wax-red-bg rounded-lg transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
    </>
  );
}
