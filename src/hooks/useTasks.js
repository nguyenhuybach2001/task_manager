"use client";
import { useState, useEffect, createContext, useContext } from 'react';
import { subscribeToTasks } from '../firebase/firestore';
import { useAuth } from './useAuth';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTasks(user.uid, (tasksData) => {
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi lấy dữ liệu:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Computed stats
  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return (
    <TasksContext.Provider value={{ tasks, loading, stats }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
}

