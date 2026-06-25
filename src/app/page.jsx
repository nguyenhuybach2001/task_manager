"use client";
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Loader2 } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/tasks/TaskCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, stats } = useTasks();
  const router = useRouter();

  const recentTasks = tasks.slice(0, 5);
  const urgentTasks = tasks
    .filter(t => t.priority === 'high' && t.status !== 'completed')
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
        <span className="ml-2 text-ink-muted">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-ink mb-1">
          {greeting()}, {user?.displayName?.split(' ')[0] || 'bạn'} 👋
        </h1>
        <p className="text-lg text-ink-muted">
          {tasks.length === 0
            ? 'Bạn chưa có công việc nào. Hãy tạo công việc đầu tiên!'
            : `Bạn có ${stats.inProgress} công việc đang thực hiện`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-parchment-light border border-border-light rounded-xl p-5 shadow-vintage flex flex-col justify-center">
          <div className="text-sm font-ui text-ink-muted uppercase tracking-wider mb-2">Tổng công việc</div>
          <div className="text-3xl font-heading font-bold text-ink">📋 {stats.total}</div>
        </div>
        <div className="bg-parchment-light border border-border-light rounded-xl p-5 shadow-vintage flex flex-col justify-center">
          <div className="text-sm font-ui text-ink-muted uppercase tracking-wider mb-2">Đang thực hiện</div>
          <div className="text-3xl font-heading font-bold text-amber">⏳ {stats.inProgress}</div>
        </div>
        <div className="bg-parchment-light border border-border-light rounded-xl p-5 shadow-vintage flex flex-col justify-center">
          <div className="text-sm font-ui text-ink-muted uppercase tracking-wider mb-2">Hoàn thành</div>
          <div className="text-3xl font-heading font-bold text-sage">✅ {stats.completed}</div>
        </div>
        <div className="bg-parchment-light border border-border-light rounded-xl p-5 shadow-vintage flex flex-col justify-center">
          <div className="text-sm font-ui text-ink-muted uppercase tracking-wider mb-2">Quá hạn</div>
          <div className="text-3xl font-heading font-bold text-wax-red">🔴 {stats.overdue}</div>
        </div>
      </div>

      {urgentTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-heading font-bold text-ink mb-4 flex items-center gap-2">
            🔥 Khẩn cấp
          </h2>
          <div className="flex flex-col gap-4">
            {urgentTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => router.push(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-heading font-bold text-ink flex items-center gap-2">
            📝 Công việc gần đây
          </h2>
          {tasks.length > 5 && (
            <button 
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-1 text-sm font-medium text-copper hover:text-copper-dark transition-colors"
            >
              Xem tất cả <ArrowRight size={16} />
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="bg-parchment-light border border-border-light rounded-xl p-10 shadow-vintage text-center flex flex-col items-center justify-center">
            <div className="text-4xl mb-4 opacity-50">📋</div>
            <p className="text-ink-muted mb-4">Chưa có công việc nào</p>
            <button 
              onClick={() => router.push('/tasks/new')}
              className="flex items-center gap-2 bg-copper text-white px-5 py-2.5 rounded-lg hover:bg-copper-dark transition-colors font-medium shadow-sm"
            >
              <Plus size={18} /> Tạo công việc đầu tiên
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recentTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => router.push(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
