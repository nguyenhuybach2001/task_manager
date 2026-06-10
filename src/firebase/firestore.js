import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { calculatePriority } from '../utils/priority';

const TASKS_COLLECTION = 'tasks';

/**
 * Create a new task
 */
export async function createTask(userId, taskData) {
  const now = new Date();
  const task = {
    userId,
    name: taskData.name,
    type: taskData.type || 'fixed',
    flexibleMode: taskData.flexibleMode || 'all_known',
    status: 'not_started',
    priority: 'low',
    startDate: taskData.startDate ? Timestamp.fromDate(new Date(taskData.startDate)) : null,
    dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
    notification: {
      enabled: taskData.notification?.enabled ?? true,
      beforeDeadlineDays: taskData.notification?.beforeDeadlineDays ?? 2,
      beforeStartDays: taskData.notification?.beforeStartDays ?? 1,
      dailyRemindTime: taskData.notification?.dailyRemindTime ?? '09:00',
    },
    steps: (taskData.steps || []).map((step, index) => ({
      id: crypto.randomUUID(),
      name: step.name || '',
      content: step.content || '',
      order: index,
      status: index === 0 ? 'in_progress' : 'pending',
      startDate: step.startDate ? Timestamp.fromDate(new Date(step.startDate)) : null,
      dueDate: step.dueDate ? Timestamp.fromDate(new Date(step.dueDate)) : null,
      contactPerson: {
        name: step.contactPerson?.name || '',
        phone: step.contactPerson?.phone || '',
        email: step.contactPerson?.email || '',
      },
    })),
    currentStepIndex: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Calculate priority
  if (task.dueDate) {
    task.priority = calculatePriority(task);
  }

  // If there are steps, task is in progress
  if (task.steps.length > 0) {
    task.status = 'in_progress';
  }

  const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);
  return { id: docRef.id, ...task };
}

/**
 * Update a task
 */
export async function updateTask(taskId, updates) {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const updateData = { ...updates, updatedAt: serverTimestamp() };

  // Convert date strings to Timestamps
  if (updateData.startDate && typeof updateData.startDate === 'string') {
    updateData.startDate = Timestamp.fromDate(new Date(updateData.startDate));
  }
  if (updateData.dueDate && typeof updateData.dueDate === 'string') {
    updateData.dueDate = Timestamp.fromDate(new Date(updateData.dueDate));
  }

  // Convert step dates
  if (updateData.steps) {
    updateData.steps = updateData.steps.map(step => ({
      ...step,
      startDate: step.startDate instanceof Timestamp ? step.startDate
        : step.startDate ? Timestamp.fromDate(new Date(step.startDate)) : null,
      dueDate: step.dueDate instanceof Timestamp ? step.dueDate
        : step.dueDate ? Timestamp.fromDate(new Date(step.dueDate)) : null,
    }));
  }

  await updateDoc(taskRef, updateData);
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}

/**
 * Get a single task
 */
export async function getTask(taskId) {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    return { id: taskSnap.id, ...taskSnap.data() };
  }
  return null;
}

/**
 * Complete a step and auto-advance
 */
export async function completeStep(taskId, stepIndex) {
  const task = await getTask(taskId);
  if (!task) return;

  const steps = [...task.steps];
  steps[stepIndex].status = 'completed';

  // Auto-advance to next step
  const nextIndex = stepIndex + 1;
  let newStatus = task.status;
  let newCurrentIndex = task.currentStepIndex;

  if (nextIndex < steps.length) {
    steps[nextIndex].status = 'in_progress';
    newCurrentIndex = nextIndex;
  } else {
    // All steps completed
    newStatus = 'completed';
  }

  // Recalculate priority
  const updatedTask = { ...task, steps, status: newStatus };
  const priority = calculatePriority(updatedTask);

  await updateTask(taskId, {
    steps,
    status: newStatus,
    currentStepIndex: newCurrentIndex,
    priority,
  });
}

/**
 * Add a new step to a flexible task (step_by_step mode)
 */
export async function addStepToTask(taskId, stepData) {
  const task = await getTask(taskId);
  if (!task) return;

  const newStep = {
    id: crypto.randomUUID(),
    name: stepData.name || '',
    content: stepData.content || '',
    order: task.steps.length,
    status: 'pending',
    startDate: stepData.startDate ? Timestamp.fromDate(new Date(stepData.startDate)) : null,
    dueDate: stepData.dueDate ? Timestamp.fromDate(new Date(stepData.dueDate)) : null,
    contactPerson: {
      name: stepData.contactPerson?.name || '',
      phone: stepData.contactPerson?.phone || '',
      email: stepData.contactPerson?.email || '',
    },
  };

  const steps = [...task.steps, newStep];
  await updateTask(taskId, { steps });
}

/**
 * Subscribe to real-time task updates for a user
 */
export function subscribeToTasks(userId, callback, onError) {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      // Recalculate priority in real-time
      const priority = calculatePriority(data);
      // Check if any steps are overdue
      const now = new Date();
      let status = data.status;
      if (status !== 'completed' && data.dueDate) {
        const dueDate = data.dueDate.toDate ? data.dueDate.toDate() : new Date(data.dueDate);
        if (dueDate < now) {
          status = 'overdue';
        }
      }
      return {
        id: doc.id,
        ...data,
        priority,
        status,
      };
    });

    // Sort by createdAt desc in memory to avoid needing composite index
    tasks.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    callback(tasks);
  }, (error) => {
    console.error("Firestore error:", error);
    if (onError) onError(error);
  });
}
