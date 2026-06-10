import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Typography, Button, Empty, Spin, Segmented } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';

const { Title, Text } = Typography;

export default function TaskList() {
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(task => {
    // Filter
    if (filter === 'active') return task.status === 'in_progress';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') return task.status === 'overdue';
    if (filter === 'high') return task.priority === 'high';
    if (filter === 'fixed') return task.type === 'fixed';
    if (filter === 'flexible') return task.type === 'flexible';
    return true;
  }).filter(task => {
    if (!search) return true;
    return task.name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
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
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>📝 Công việc</Title>
          <Text type="secondary">{tasks.length} công việc</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/tasks/new')}>
          Tạo mới
        </Button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Input
          size="large"
          placeholder="Tìm kiếm công việc..."
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        <Segmented
          options={filters}
          value={filter}
          onChange={setFilter}
          size="large"
          style={{ padding: 4 }}
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#f4ecd8', borderRadius: 12 }}>
          <Empty
            description={search ? 'Không có kết quả phù hợp' : 'Chưa có công việc nào trong danh mục này'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
