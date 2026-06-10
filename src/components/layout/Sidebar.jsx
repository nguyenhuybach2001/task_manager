import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, theme } from 'antd';
import { LogoutOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../firebase/auth';
import { NAV_ITEMS } from '../../utils/constants';
import { useTasks } from '../../hooks/useTasks';

const { Sider } = Layout;

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { stats } = useTasks();
  const { token } = theme.useToken();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const items = NAV_ITEMS.map((item) => ({
    key: item.path,
    icon: <span>{item.icon}</span>,
    label: item.label,
  }));

  const menuItems = [
    { type: 'group', label: 'Menu', children: items },
    { type: 'divider' },
    { type: 'group', label: 'Nhanh', children: [
      { key: '/tasks/new', icon: <PlusOutlined />, label: 'Tạo công việc mới' }
    ]},
  ];

  if (stats.overdue > 0) {
    menuItems.push({ type: 'divider' });
    menuItems.push({
      type: 'group',
      label: 'Cảnh báo',
      children: [
        { key: 'warning', icon: <WarningOutlined style={{color: '#cf6679'}} />, label: <span style={{color: '#cf6679'}}>{stats.overdue} công việc quá hạn</span>, disabled: true }
      ]
    });
  }

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      theme="light"
      style={{
        borderRight: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
      }}
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 18, fontWeight: 'bold', borderBottom: `1px solid ${token.colorBorder}` }}>
        📋 <span style={{ marginLeft: 8, fontFamily: token.fontFamily }}>Task Manager</span>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => key !== 'warning' && navigate(key)}
        items={menuItems}
        style={{ borderRight: 0, marginTop: 16, background: 'transparent' }}
      />
      
      <div style={{ position: 'absolute', bottom: 0, width: '100%', borderTop: `1px solid ${token.colorBorder}`, padding: '16px', background: token.colorBgContainer }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={user?.photoURL} style={{ backgroundColor: token.colorPrimary }}>
            {!user?.photoURL && getInitials(user?.displayName)}
          </Avatar>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.displayName || 'User'}</div>
            <div style={{ fontSize: 12, color: token.colorTextSecondary, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</div>
          </div>
          <LogoutOutlined onClick={handleSignOut} style={{ cursor: 'pointer', color: token.colorTextSecondary }} title="Đăng xuất" />
        </div>
      </div>
    </Sider>
  );
}
