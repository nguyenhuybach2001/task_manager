import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Switch, TimePicker, InputNumber, Button, Card, Space, Row, Col, Divider, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UpOutlined, DownOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { createTask } from '../firebase/firestore';
import { TASK_TYPES, FLEXIBLE_MODES, TYPE_LABELS, FLEXIBLE_MODE_LABELS } from '../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function TaskNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  
  const typeValue = Form.useWatch('type', form);
  const notificationEnabled = Form.useWatch(['notification', 'enabled'], form);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        notification: {
          ...values.notification,
          dailyRemindTime: values.notification?.dailyRemindTime ? values.notification.dailyRemindTime.format('HH:mm') : '09:00',
        },
        steps: (values.steps || []).map(step => ({
          ...step,
          startDate: step.startDate ? step.startDate.toISOString() : null,
          dueDate: step.dueDate ? step.dueDate.toISOString() : null,
        }))
      };

      const task = await createTask(user.uid, formattedValues);
      addToast('Tạo công việc thành công!', 'success');
      navigate(`/tasks/${task.id}`);
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Tạo công việc mới</Title>
          <Text type="secondary">Điền thông tin chi tiết cho công việc</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: TASK_TYPES.FIXED,
          flexibleMode: FLEXIBLE_MODES.ALL_KNOWN,
          notification: {
            enabled: true,
            beforeDeadlineDays: 2,
            beforeStartDays: 1,
            dailyRemindTime: dayjs('09:00', 'HH:mm'),
          },
          steps: [{}]
        }}
      >
        {/* Thông tin cơ bản */}
        <Card title={<span><span style={{marginRight:8}}>📝</span>Thông tin cơ bản</span>} bordered={false} style={{ marginBottom: 24 }}>
          <Form.Item
            name="name"
            label="Tên công việc"
            rules={[{ required: true, message: 'Vui lòng nhập tên công việc' }]}
          >
            <Input size="large" placeholder="VD: Hoàn thành báo cáo quý..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Loại công việc">
                <Select size="large">
                  <Option value={TASK_TYPES.FIXED}>{TYPE_LABELS.fixed}</Option>
                  <Option value={TASK_TYPES.FLEXIBLE}>{TYPE_LABELS.flexible}</Option>
                </Select>
              </Form.Item>
            </Col>
            
            {typeValue === TASK_TYPES.FLEXIBLE && (
              <Col xs={24} md={12}>
                <Form.Item 
                  name="flexibleMode" 
                  label="Chế độ linh hoạt"
                  tooltip="Từng bước: Bạn chỉ cần nhập bước đầu tiên. Biết tất cả: Nhập tất cả các bước bạn đã biết."
                >
                  <Select size="large">
                    <Option value={FLEXIBLE_MODES.ALL_KNOWN}>{FLEXIBLE_MODE_LABELS.all_known}</Option>
                    <Option value={FLEXIBLE_MODES.STEP_BY_STEP}>{FLEXIBLE_MODE_LABELS.step_by_step}</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dueDate" label="Thời hạn hoàn thành">
                <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Cài đặt thông báo */}
        <Card title={<span><span style={{marginRight:8}}>🔔</span>Cài đặt thông báo</span>} bordered={false} style={{ marginBottom: 24 }}>
          <Form.Item name={['notification', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="Bật thông báo" unCheckedChildren="Tắt thông báo" />
          </Form.Item>

          {notificationEnabled !== false && (
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item name={['notification', 'beforeDeadlineDays']} label="Trước deadline (ngày)">
                  <InputNumber min={1} max={30} style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name={['notification', 'beforeStartDays']} label="Trước ngày bắt đầu (ngày)">
                  <InputNumber min={1} max={30} style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name={['notification', 'dailyRemindTime']} label="Giờ thông báo">
                  <TimePicker format="HH:mm" style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>

        {/* Các bước */}
        <Card 
          title={<span><span style={{marginRight:8}}>📌</span>Các bước thực hiện</span>} 
          bordered={false} 
          style={{ marginBottom: 24 }}
        >
          <Form.List name="steps">
            {(fields, { add, remove, move }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card 
                    key={key}
                    type="inner" 
                    title={`Bước ${index + 1}`}
                    extra={
                      <Space>
                        <Button type="text" icon={<UpOutlined />} disabled={index === 0} onClick={() => move(index, index - 1)} />
                        <Button type="text" icon={<DownOutlined />} disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} />
                        {fields.length > 1 && <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />}
                      </Space>
                    }
                    style={{ marginBottom: 16, background: 'var(--parchment)', borderColor: 'var(--border-light)' }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Tên bước"
                      rules={[{ required: true, message: 'Vui lòng nhập tên bước' }]}
                    >
                      <Input placeholder="VD: Thu thập dữ liệu..." />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      label="Nội dung"
                    >
                      <TextArea placeholder="Mô tả chi tiết bước này..." rows={2} />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'startDate']}
                          label="Ngày bắt đầu bước"
                        >
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dueDate']}
                          label="Thời hạn bước"
                        >
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider dashed style={{ margin: '12px 0' }} orientation="left" plain>
                      <Text type="secondary" style={{ fontSize: 12 }}>👤 Người liên hệ (tuỳ chọn)</Text>
                    </Divider>

                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'contactPerson', 'name']} style={{ marginBottom: 0 }}>
                          <Input placeholder="Tên" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'contactPerson', 'phone']} style={{ marginBottom: 0 }}>
                          <Input placeholder="SĐT" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'contactPerson', 'email']} style={{ marginBottom: 0 }}>
                          <Input placeholder="Email" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">
                  Thêm bước mới
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item style={{ textAlign: 'right', marginBottom: 40 }}>
          <Space size="large">
            <Button size="large" onClick={() => navigate(-1)}>Huỷ</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}>
              Tạo công việc
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
