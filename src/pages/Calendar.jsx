import { useNavigate } from 'react-router-dom';
import { Calendar as AntCalendar, Badge, Card, Typography } from 'antd';
import { useTasks } from '../hooks/useTasks';
import { toDate } from '../utils/dates';
import { isSameDay } from 'date-fns';

const { Title, Text } = Typography;

export default function Calendar() {
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const getTasksForDate = (date) => {
    const jsDate = date.toDate();
    return tasks.filter(task => {
      const dueDate = toDate(task.dueDate);
      const startDate = toDate(task.startDate);
      if (dueDate && isSameDay(dueDate, jsDate)) return true;
      if (startDate && isSameDay(startDate, jsDate)) return true;
      return (task.steps || []).some(step => {
        const stepDue = toDate(step.dueDate);
        const stepStart = toDate(step.startDate);
        return (stepDue && isSameDay(stepDue, jsDate)) || (stepStart && isSameDay(stepStart, jsDate));
      });
    });
  };

  const dateCellRender = (value) => {
    const dayTasks = getTasksForDate(value);
    return (
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {dayTasks.map(task => {
          let status = 'default';
          if (task.priority === 'high') status = 'error';
          else if (task.priority === 'medium') status = 'warning';
          else if (task.status === 'completed') status = 'success';
          else status = 'processing';

          return (
            <li key={task.id} onClick={(e) => {
              e.stopPropagation();
              navigate(`/tasks/${task.id}`);
            }} style={{ marginBottom: 2, cursor: 'pointer' }} title={task.name}>
              <Badge status={status} text={
                <span style={{ 
                  fontSize: 12, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 14px)',
                  display: 'inline-block',
                  verticalAlign: 'bottom'
                }}>
                  {task.name}
                </span>
              } />
            </li>
          );
        })}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>📅 Lịch</Title>
        <Text type="secondary">Xem tổng quan công việc theo tháng</Text>
      </div>

      <Card bordered={false} styles={{ body: { padding: '16px 24px' } }}>
        <AntCalendar cellRender={cellRender} />
      </Card>
    </div>
  );
}
