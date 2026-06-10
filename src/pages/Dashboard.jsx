import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, Button, Empty, Spin } from 'antd';
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/tasks/TaskCard';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, stats } = useTasks();
  const navigate = useNavigate();

  const recentTasks = tasks.slice(0, 5);
  const urgentTasks = tasks
    .filter(t => t.priority === 'high' && t.status !== 'completed')
    .slice(0, 3);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
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
    <div className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
          {greeting()}, {user?.displayName?.split(' ')[0] || 'bạn'} 👋
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {tasks.length === 0
            ? 'Bạn chưa có công việc nào. Hãy tạo công việc đầu tiên!'
            : `Bạn có ${stats.inProgress} công việc đang thực hiện`
          }
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Tổng công việc" value={stats.total} prefix="📋" />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Đang thực hiện" value={stats.inProgress} prefix="⏳" valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Hoàn thành" value={stats.completed} prefix="✅" valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Quá hạn" value={stats.overdue} prefix="🔴" valueStyle={{ color: '#cf6679', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      {urgentTasks.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🔥 Khẩn cấp</Title>
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {urgentTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>📝 Công việc gần đây</Title>
          {tasks.length > 5 && (
            <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/tasks')} style={{ padding: 0 }}>
              Xem tất cả
            </Button>
          )}
        </div>

        {tasks.length === 0 ? (
          <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
            <Empty
              description="Chưa có công việc nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/tasks/new')} style={{ marginTop: 16 }}>
                Tạo công việc đầu tiên
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recentTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
