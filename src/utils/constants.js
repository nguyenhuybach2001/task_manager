export const TASK_TYPES = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible',
};

export const FLEXIBLE_MODES = {
  ALL_KNOWN: 'all_known',
  STEP_BY_STEP: 'step_by_step',
};

export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

export const STEP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const STATUS_LABELS = {
  not_started: 'Chưa bắt đầu',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  overdue: 'Quá hạn',
};

export const STEP_STATUS_LABELS = {
  pending: 'Chờ',
  in_progress: 'Đang làm',
  completed: 'Xong',
};

export const TYPE_LABELS = {
  fixed: 'Cố định',
  flexible: 'Linh hoạt',
};

export const FLEXIBLE_MODE_LABELS = {
  all_known: 'Biết tất cả các bước',
  step_by_step: 'Từng bước một',
};

export const NAV_ITEMS = [
  { path: '/', label: 'Tổng quan', icon: '📊' },
  { path: '/tasks', label: 'Công việc', icon: '📝' },
  { path: '/calendar', label: 'Lịch', icon: '📅' },
  { path: '/settings', label: 'Cài đặt', icon: '⚙️' },
];
