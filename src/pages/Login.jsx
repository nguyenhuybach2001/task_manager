import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '../firebase/auth';
import { useToast } from '../hooks/useToast';
import { Form, Input, Button, Divider, Typography, Card } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { addToast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      addToast('Đăng nhập thành công!', 'success');
    } catch (error) {
      addToast('Lỗi đăng nhập: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(values.email, values.password, values.displayName);
        addToast('Đăng ký thành công!', 'success');
      } else {
        await signInWithEmail(values.email, values.password);
        addToast('Đăng nhập thành công!', 'success');
      }
    } catch (error) {
      const msg = error.code === 'auth/user-not-found' ? 'Email không tồn tại'
        : error.code === 'auth/wrong-password' ? 'Sai mật khẩu'
        : error.code === 'auth/email-already-in-use' ? 'Email đã được sử dụng'
        : error.code === 'auth/weak-password' ? 'Mật khẩu quá yếu (tối thiểu 6 ký tự)'
        : error.message;
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--parchment)'
    }}>
      <Card 
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 24px rgba(44, 36, 23, 0.08)',
          borderRadius: 16
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Task Manager</Title>
          <Text type="secondary">Quản lý công việc — Vintage Edition</Text>
        </div>

        <Button 
          block 
          size="large" 
          icon={<GoogleOutlined />} 
          onClick={handleGoogleLogin}
          loading={loading}
          style={{ marginBottom: 24, height: 44 }}
        >
          Đăng nhập với Google
        </Button>

        <Divider plain>hoặc</Divider>

        <Form
          form={form}
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          {isRegister && (
            <Form.Item
              name="displayName"
              label="Tên hiển thị"
              rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}
            >
              <Input size="large" prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Tên của bạn" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input size="large" prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ height: 44 }}>
              {isRegister ? 'Đăng ký' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} {' '}
          </Text>
          <Link onClick={() => {
            setIsRegister(!isRegister);
            form.resetFields();
          }}>
            {isRegister ? 'Đăng nhập' : 'Đăng ký'}
          </Link>
        </div>
      </Card>
    </div>
  );
}
