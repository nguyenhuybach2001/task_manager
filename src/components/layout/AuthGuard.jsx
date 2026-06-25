"use client";
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { TasksProvider } from '../../hooks/useTasks';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (loading) return;

    if (!user && !isLoginPage) {
      router.replace('/login');
    } else if (user && isLoginPage) {
      router.replace('/');
    }
  }, [user, loading, isLoginPage, router]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-copper" />
          <span className="text-ink-muted font-medium">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Not logged in → only render login page
  if (!user) {
    if (!isLoginPage) return null;
    return <>{children}</>;
  }

  // Logged in but on login page → wait for redirect
  if (isLoginPage) return null;

  // Logged in → render full layout with sidebar + shared tasks context
  return (
    <TasksProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen transition-all duration-300 relative">
          {children}
        </main>
      </div>
    </TasksProvider>
  );
}
