"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Loader2, FileQuestion } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import TaskCard from '../../components/tasks/TaskCard';
import { toDate } from '../../utils/dates';

export default function TaskList() {
  const { tasks, loading } = useTasks();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status === 'in_progress';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') return task.status === 'overdue';
    if (filter === 'high') return task.priority === 'high';
    return true;
  }).filter(task => {
    if (!search) return true;
    return task.name.toLowerCase().includes(search.toLowerCase());
  });

  const getTaskMonth = (task) => {
    let dateStr = null;
    if (task.dueDate) dateStr = task.dueDate;
    else if (task.startDate) dateStr = task.startDate;
    else if (task.createdAt) dateStr = task.createdAt;
    
    const parsedDate = toDate(dateStr);
    const date = parsedDate || new Date();
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const month = getTaskMonth(task);
    if (!acc[month]) acc[month] = [];
    acc[month].push(task);
    return acc;
  }, {});

  const monthKeys = Object.keys(groupedTasks).sort((a, b) => {
    const [monthA, yearA] = a.replace('Tháng ', '').split(', ').map(Number);
    const [monthB, yearB] = b.replace('Tháng ', '').split(', ').map(Number);
    if (yearA !== yearB) return yearB - yearA;
    return monthB - monthA;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
        <span className="ml-2 text-ink-muted">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const filters = [
    { value: 'all', label: `Tất cả (${tasks.length})` },
    { value: 'active', label: `Đang làm (${tasks.filter(t => t.status === 'in_progress').length})` },
    { value: 'completed', label: `Hoàn thành (${tasks.filter(t => t.status === 'completed').length})` },
    { value: 'overdue', label: `Quá hạn (${tasks.filter(t => t.status === 'overdue').length})` },
    { value: 'high', label: `🔴 Khẩn (${tasks.filter(t => t.priority === 'high').length})` },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink mb-1 flex items-center gap-2">
            📝 Công việc
          </h1>
          <p className="text-lg text-ink-muted">{tasks.length} công việc</p>
        </div>
        <button 
          onClick={() => router.push('/tasks/new')}
          className="flex items-center gap-2 bg-copper text-white px-5 py-2.5 rounded-lg hover:bg-copper-dark transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Tạo mới
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
            placeholder="Tìm kiếm công việc..."
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center bg-parchment-light p-1.5 rounded-xl border border-border-light shadow-sm w-max overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.value 
                  ? 'bg-copper text-white shadow-sm' 
                  : 'text-ink-muted hover:bg-parchment-dark hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-[#f4ecd8] border border-border-light rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-inner">
          <FileQuestion className="w-16 h-16 text-ink-muted/50 mb-4" />
          <p className="text-ink text-lg font-medium">
            {search ? 'Không có kết quả phù hợp' : 'Chưa có công việc nào trong danh mục này'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 stagger-children">
          {monthKeys.map(month => (
            <div key={month}>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-ink-muted whitespace-nowrap">{month}</h3>
                <div className="flex-1 border-t border-border-light/60"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {groupedTasks[month].map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
