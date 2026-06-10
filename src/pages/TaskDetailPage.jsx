import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Tag, Progress, Spin, Row, Col, Descriptions, Timeline, Modal, Space, Form, Input, DatePicker, Empty } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, CheckCircleOutlined, PlusOutlined, ClockCircleOutlined, InfoCircleOutlined, BellOutlined } from '@ant-design/icons';
import { getTask, completeStep, deleteTask, addStepToTask } from '../firebase/firestore';
import { useToast } from '../hooks/useToast';
import { getPriorityLabel } from '../utils/priority';
import { formatDate, formatDateLong, getDeadlineLabel } from '../utils/dates';
import { TYPE_LABELS, STATUS_LABELS, STEP_STATUS_LABELS, FLEXIBLE_MODE_LABELS } from '../utils/constants';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStep, setShowAddStep] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    const data = await getTask(id);
    setTask(data);
    setLoading(false);
  };

  const handleCompleteStep = async (stepIndex) => {
    try {
      await completeStep(id, stepIndex);
      addToast('Bước đã hoàn thành! ✅', 'success');
      await loadTask();
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleDeleteTask = () => {
    Modal.confirm({
      title: '⚠️ Xác nhận xoá',
      content: `Bạn có chắc muốn xoá công việc "${task.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          await deleteTask(id);
          addToast('Đã xoá công việc', 'info');
          navigate('/tasks');
        } catch (error) {
          addToast('Lỗi: ' + error.message, 'error');
        }
      }
    });
  };

  const handleAddStep = async (values) => {
    try {
      const formattedStep = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };
      await addStepToTask(id, formattedStep);
      addToast('Đã thêm bước mới', 'success');
      form.resetFields();
      setShowAddStep(false);
      await loadTask();
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty description="Không tìm thấy công việc">
          <Button type="primary" onClick={() => navigate('/tasks')}>Quay lại danh sách</Button>
        </Empty>
      </div>
    );
  }

  const completedSteps = task.steps.filter(s => s.status === 'completed').length;
  const totalSteps = task.steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const deadline = getDeadlineLabel(task.dueDate);
  const isFlexibleStepByStep = task.type === 'flexible' && task.flexibleMode === 'step_by_step';

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
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tasks')} type="text" />
          <div>
            <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{task.name}</Title>
            <Text type="secondary">
              {TYPE_LABELS[task.type]}
              {task.type === 'flexible' && ` • ${FLEXIBLE_MODE_LABELS[task.flexibleMode]}`}
            </Text>
          </div>
        </div>
        <Button danger icon={<DeleteOutlined />} onClick={handleDeleteTask}>
          Xoá
        </Button>
      </div>

      {/* Status Bar */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Space size="large" wrap>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Trạng thái</Text>
                <Tag color={getStatusColor(task.status)} style={{ margin: 0, fontSize: 14, padding: '4px 8px' }}>
                  {STATUS_LABELS[task.status]}
                </Tag>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Mức độ ưu tiên</Text>
                <Tag color={getPriorityColor(task.priority)} style={{ margin: 0, fontSize: 14, padding: '4px 8px' }}>
                  {getPriorityLabel(task.priority)}
                </Tag>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Thời hạn</Text>
                <Text strong style={{ color: deadline.urgent ? '#cf6679' : 'inherit', fontSize: 15 }}>
                  {deadline.text}
                </Text>
              </div>
            </Space>
          </Col>
          {totalSteps > 0 && (
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tiến độ ({completedSteps}/{totalSteps})</Text>
                <Progress 
                  percent={progress} 
                  status={task.status === 'completed' ? 'success' : task.priority === 'high' ? 'exception' : 'active'}
                  strokeColor={task.status !== 'completed' && task.priority !== 'high' ? '#b87333' : undefined}
                />
              </div>
            </Col>
          )}
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column - Steps */}
        <Col xs={24} md={16}>
          <Card 
            title={<span><span style={{marginRight:8}}>📌</span>Các bước thực hiện</span>} 
            bordered={false}
            extra={
              (isFlexibleStepByStep || task.type === 'flexible') && task.status !== 'completed' && (
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => setShowAddStep(!showAddStep)}>
                  Thêm bước
                </Button>
              )
            }
          >
            {task.steps.length === 0 ? (
              <Empty description="Chưa có bước nào" />
            ) : (
              <Timeline
                mode="left"
                items={task.steps.map((step, index) => {
                  if (isFlexibleStepByStep && index > task.currentStepIndex + 1 && step.status === 'pending') {
                    return null;
                  }
                  
                  const isActive = step.status === 'in_progress';
                  const isCompleted = step.status === 'completed';

                  return {
                    color: isCompleted ? 'green' : isActive ? 'blue' : 'gray',
                    dot: isCompleted ? <CheckCircleOutlined style={{ fontSize: 16 }} /> : isActive ? <ClockCircleOutlined style={{ fontSize: 16 }} /> : undefined,
                    children: (
                      <Card 
                        size="small" 
                        type="inner"
                        style={{ 
                          marginBottom: 16, 
                          borderColor: isActive ? '#b87333' : 'var(--border-light)',
                          background: isActive ? '#fffbfa' : 'var(--parchment)',
                          opacity: step.status === 'pending' ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 16, color: isActive ? '#b87333' : 'inherit' }}>
                            {step.name || `Bước ${index + 1}`}
                          </Text>
                          <Tag color={isCompleted ? 'success' : isActive ? 'processing' : 'default'}>
                            {STEP_STATUS_LABELS[step.status]}
                          </Tag>
                        </div>

                        {step.content && (
                          <Text style={{ display: 'block', marginBottom: 12, whiteSpace: 'pre-wrap' }}>{step.content}</Text>
                        )}

                        <Space size="large" wrap style={{ marginBottom: 12 }}>
                          {step.startDate && (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} /> Bắt đầu: {formatDate(step.startDate)}
                            </Text>
                          )}
                          {step.dueDate && (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              <InfoCircleOutlined style={{ marginRight: 4 }} /> Hạn chót: {formatDate(step.dueDate)}
                            </Text>
                          )}
                        </Space>

                        {step.contactPerson?.name && (
                          <div style={{ background: '#f4ecd8', padding: '8px 12px', borderRadius: 6, display: 'inline-block' }}>
                            <Text strong style={{ fontSize: 13, display: 'block' }}>👤 {step.contactPerson.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {[step.contactPerson.phone, step.contactPerson.email].filter(Boolean).join(' • ')}
                            </Text>
                          </div>
                        )}

                        {isActive && (
                          <div style={{ marginTop: 16 }}>
                            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleCompleteStep(index)}>
                              Hoàn thành bước này
                            </Button>
                          </div>
                        )}
                      </Card>
                    )
                  };
                }).filter(Boolean)}
              />
            )}

            {/* Form thêm bước mới */}
            {showAddStep && (
              <Card type="inner" title="Thêm bước mới" style={{ marginTop: 24, borderStyle: 'dashed' }}>
                <Form form={form} layout="vertical" onFinish={handleAddStep}>
                  <Form.Item name="name" label="Tên bước" rules={[{ required: true, message: 'Nhập tên bước' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="content" label="Nội dung">
                    <TextArea rows={2} />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="startDate" label="Ngày bắt đầu">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="dueDate" label="Hạn chót">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Space>
                    <Button type="primary" htmlType="submit">Thêm bước</Button>
                    <Button onClick={() => setShowAddStep(false)}>Huỷ</Button>
                  </Space>
                </Form>
              </Card>
            )}
          </Card>
        </Col>

        {/* Right Column - Info */}
        <Col xs={24} md={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title={<span><span style={{marginRight:8}}>📋</span>Chi tiết</span>} bordered={false}>
              <Descriptions column={1} size="small" labelStyle={{ color: 'var(--ink-muted)' }}>
                <Descriptions.Item label="Ngày tạo">
                  <Text strong>{formatDateLong(task.createdAt)}</Text>
                </Descriptions.Item>
                {task.startDate && (
                  <Descriptions.Item label="Ngày bắt đầu">
                    <Text strong>{formatDateLong(task.startDate)}</Text>
                  </Descriptions.Item>
                )}
                {task.dueDate && (
                  <Descriptions.Item label="Hạn chót">
                    <Text strong style={{ color: deadline.urgent ? '#cf6679' : 'inherit' }}>
                      {formatDateLong(task.dueDate)}
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title={<span><span style={{marginRight:8}}>🔔</span>Thông báo</span>} bordered={false}>
              {task.notification?.enabled ? (
                <Descriptions column={1} size="small" labelStyle={{ color: 'var(--ink-muted)' }}>
                  <Descriptions.Item label="Trạng thái">
                    <Text type="success">Đã bật</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trước deadline">
                    {task.notification.beforeDeadlineDays} ngày
                  </Descriptions.Item>
                  <Descriptions.Item label="Trước lúc bắt đầu">
                    {task.notification.beforeStartDays} ngày
                  </Descriptions.Item>
                  <Descriptions.Item label="Giờ nhắc">
                    {task.notification.dailyRemindTime}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">Thông báo đã bị tắt</Text>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
