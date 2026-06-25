import { Calendar, MapPin } from 'lucide-react';
import { getPriorityLabel } from '../../utils/priority';
import { getDeadlineLabel } from '../../utils/dates';
import { TYPE_LABELS, STATUS_LABELS } from '../../utils/constants';

export default function TaskCard({ task, onClick }) {
  const completedSteps = (task.steps || []).filter(s => s.status === 'completed').length;
  const totalSteps = (task.steps || []).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const deadline = getDeadlineLabel(task.dueDate);

  let borderClass = 'border-l-sage';
  if (task.priority === 'high') borderClass = 'border-l-wax-red';
  else if (task.priority === 'medium') borderClass = 'border-l-amber';

  let priorityBg = 'bg-sage-bg text-sage border-sage/20';
  if (task.priority === 'high') priorityBg = 'bg-wax-red-bg text-wax-red border-wax-red/20';
  else if (task.priority === 'medium') priorityBg = 'bg-amber-bg text-amber border-amber/20';

  let statusBg = 'bg-ink-faint/10 text-ink-muted';
  if (task.status === 'completed') statusBg = 'bg-sage-bg text-sage';
  else if (task.status === 'in_progress') statusBg = 'bg-amber-bg text-amber';
  else if (task.status === 'overdue') statusBg = 'bg-wax-red-bg text-wax-red';

  let progressColor = 'bg-copper';
  if (task.status === 'completed') progressColor = 'bg-sage';
  else if (task.priority === 'high') progressColor = 'bg-wax-red';

  return (
    <div 
      onClick={onClick}
      className={`bg-parchment-light border border-border-light rounded-xl p-5 shadow-vintage hover:shadow-md hover:-translate-y-0.5 hover:border-border transition-all duration-300 cursor-pointer border-l-4 ${borderClass} relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-3 gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-ink truncate">{task.name}</h3>
          <div className="text-xs text-ink-muted mt-1 font-typewriter">
            {TYPE_LABELS[task.type] || task.type}
            {task.type === 'flexible' && task.flexibleMode === 'step_by_step' && ' • Từng bước'}
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${priorityBg} whitespace-nowrap`}>
          {getPriorityLabel(task.priority)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className={`flex items-center gap-1.5 text-sm ${deadline.urgent ? 'text-wax-red font-bold' : 'text-ink-text'}`}>
          <Calendar size={16} />
          {deadline.text}
        </div>
        
        {totalSteps > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin size={16} />
            Bước {Math.min(completedSteps + 1, totalSteps)}/{totalSteps}
          </div>
        )}
        
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBg}`}>
          {STATUS_LABELS[task.status]}
        </div>
      </div>

      {totalSteps > 0 && (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-parchment-deep rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
