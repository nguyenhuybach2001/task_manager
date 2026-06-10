/**
 * Calculate task priority based on deadline and step statuses
 * HIGH: ≤2 days remaining or has overdue steps
 * MEDIUM: 3-5 days remaining
 * LOW: >5 days remaining
 */
export function calculatePriority(task) {
  if (!task.dueDate || task.status === 'completed') return 'low';

  const now = new Date();
  const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
  const diffMs = dueDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Check for overdue steps
  const hasOverdueStep = (task.steps || []).some(step => {
    if (step.status === 'completed') return false;
    if (!step.dueDate) return false;
    const stepDue = step.dueDate.toDate ? step.dueDate.toDate() : new Date(step.dueDate);
    return stepDue < now;
  });

  if (hasOverdueStep || remainingDays <= 2) return 'high';
  if (remainingDays <= 5) return 'medium';
  return 'low';
}

/**
 * Get priority label in Vietnamese
 */
export function getPriorityLabel(priority) {
  const labels = {
    high: 'Khẩn cấp',
    medium: 'Cần chú ý',
    low: 'Bình thường',
  };
  return labels[priority] || 'Bình thường';
}

/**
 * Get priority emoji
 */
export function getPriorityEmoji(priority) {
  const emojis = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };
  return emojis[priority] || '🟢';
}
