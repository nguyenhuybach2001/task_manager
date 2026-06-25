"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, X, Clock } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTasks } from '../../hooks/useTasks';
import { toDate } from '../../utils/dates';

export default function Calendar() {
  const { tasks, loading } = useTasks();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
        <span className="ml-2 text-ink-muted">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 });
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return tasks.filter(task => {
      // Nếu task có cả startDate và dueDate
      if (task.startDate && task.dueDate) {
        const taskStart = startOfDay(toDate(task.startDate));
        const taskEnd = endOfDay(toDate(task.dueDate));
        return dayStart >= taskStart && dayStart <= taskEnd;
      } 
      // Nếu chỉ có dueDate
      else if (task.dueDate) {
        return isSameDay(toDate(task.dueDate), date);
      }
      // Nếu chỉ có startDate
      else if (task.startDate) {
        return isSameDay(toDate(task.startDate), date);
      }
      return false;
    });
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return 'bg-wax-red text-white';
    if (p === 'medium') return 'bg-amber text-white';
    return 'bg-sage text-white';
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: 'Cần làm',
      in_progress: 'Đang làm',
      completed: 'Hoàn thành'
    };
    return labels[status] || status;
  };

  const handleDayClick = (day, dateTasks) => {
    if (dateTasks.length > 0) {
      setSelectedDate({ day, tasks: dateTasks });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink flex items-center gap-2">
          <CalendarIcon size={24} className="sm:w-7 sm:h-7" /> Lịch công việc
        </h1>
        <div className="flex items-center gap-2 sm:gap-4 bg-parchment-light border border-border-light rounded-xl p-1 shadow-sm w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={prevMonth}
            className="p-2 text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-heading font-bold text-ink min-w-[120px] sm:min-w-[140px] text-center capitalize text-sm sm:text-base">
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </div>
          <button 
            onClick={nextMonth}
            className="p-2 text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button 
            onClick={today}
            className="ml-0 sm:ml-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-parchment hover:bg-copper hover:text-white text-ink border-l border-border-light rounded-r-lg transition-colors"
          >
            Hôm nay
          </button>
        </div>
      </div>

      <div className="bg-white border border-border-light shadow-vintage rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[500px]">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-border-light bg-parchment-light">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                <div key={day} className="py-2 sm:py-3 text-center text-xs sm:text-sm font-bold text-ink-muted uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, i) => {
                const dateTasks = getTasksForDate(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const hasTasks = dateTasks.length > 0;

                return (
                  <div 
                    key={day.toString()} 
                    onClick={() => handleDayClick(day, dateTasks)}
                    className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-border-light/50 transition-colors 
                      ${!isCurrentMonth ? 'bg-parchment-light/30' : 'bg-white'} 
                      ${hasTasks ? 'cursor-pointer hover:bg-parchment-light/80 active:bg-parchment-dark' : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <span className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium ${isToday ? 'bg-copper text-white shadow-sm' : !isCurrentMonth ? 'text-ink-muted/50' : 'text-ink'}`}>
                          {format(day, dateFormat)}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center">
                        {hasTasks && (
                          <div className="w-full text-center">
                            <div className="inline-block px-2 py-1 bg-parchment-dark border border-copper/30 rounded-lg text-xs sm:text-sm font-semibold text-copper shadow-sm">
                              {dateTasks.length} task
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Popup */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedDate(null)}>
          <div 
            className="bg-parchment-light w-full max-w-md rounded-2xl shadow-vintage border border-border overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-light bg-white">
              <h2 className="text-lg font-heading font-bold text-ink">
                Ngày {format(selectedDate.day, 'dd/MM/yyyy')}
              </h2>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-1 hover:bg-parchment-dark rounded-lg text-ink-muted hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {selectedDate.tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="bg-white p-3 rounded-xl border border-border-light shadow-sm cursor-pointer hover:border-copper hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold text-sm sm:text-base group-hover:text-copper transition-colors ${task.status === 'completed' ? 'line-through text-ink-muted' : 'text-ink'}`}>
                      {task.name}
                    </h3>
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-sage' : 
                        task.status === 'in_progress' ? 'bg-amber' : 
                        'bg-ink-muted'
                      }`} />
                      {getStatusLabel(task.status)}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        Hạn: {format(toDate(task.dueDate), 'dd/MM')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
