import { Card, Tag, Progress, Typography, Space } from 'antd';
import { CalendarOutlined, PushpinOutlined } from '@ant-design/icons';
import { getPriorityLabel } from '../../utils/priority';
import { getDeadlineLabel } from '../../utils/dates';
import { TYPE_LABELS, STATUS_LABELS } from '../../utils/constants';

const { Text } = Typography;

export default function TaskCard({ task, onClick }) {
  const completedSteps = (task.steps || []).filter(s => s.status === 'completed').length;
  const totalSteps = (task.steps || []).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const deadline = getDeadlineLabel(task.dueDate);

  const getPriorityColor = (p) => {
    if (p === 'high') return 'error';
    if (p === 'medium') return 'warning';
    return 'success';
  };

  const getStatusColor = (s) => {
    if (s === 'completed') return 'success';
    if (s === 'in_progress') return 'processing';
    if (s === 'overdue') return 'error';
    return 'default';
  };

  return (
    <Card 
      hoverable 
      onClick={onClick}
      styles={{ body: { padding: '16px 20px' } }}
      style={{
        borderLeft: `4px solid ${task.priority === 'high' ? '#cf6679' : task.priority === 'medium' ? '#fa8c16' : '#52c41a'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--ink-text)' }}>{task.name}</div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {TYPE_LABELS[task.type] || task.type}
            {task.type === 'flexible' && task.flexibleMode === 'step_by_step' && ' • Từng bước'}
          </Text>
        </div>
        <Tag color={getPriorityColor(task.priority)} style={{ margin: 0 }}>
          {getPriorityLabel(task.priority)}
        </Tag>
      </div>

      <Space size="middle" style={{ marginBottom: totalSteps > 0 ? 12 : 0, flexWrap: 'wrap' }}>
        <Text style={{ color: deadline.urgent ? '#cf6679' : 'inherit', fontWeight: deadline.urgent ? 'bold' : 'normal', fontSize: 13 }}>
          <CalendarOutlined style={{ marginRight: 4 }} /> 
          {deadline.text}
        </Text>
        {totalSteps > 0 && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            <PushpinOutlined style={{ marginRight: 4 }} />
            Bước {Math.min(completedSteps + 1, totalSteps)}/{totalSteps}
          </Text>
        )}
        <Tag color={getStatusColor(task.status)} bordered={false}>
          {STATUS_LABELS[task.status]}
        </Tag>
      </Space>

      {totalSteps > 0 && (
        <Progress 
          percent={progress} 
          size="small" 
          status={task.status === 'completed' ? 'success' : task.priority === 'high' ? 'exception' : 'active'}
          strokeColor={task.status !== 'completed' && task.priority !== 'high' ? '#b87333' : undefined}
          style={{ marginBottom: 0 }}
        />
      )}
    </Card>
  );
}
