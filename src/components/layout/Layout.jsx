import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout, theme } from 'antd';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

export default function Layout() {
  const { token } = theme.useToken();

  return (
    <AntLayout style={{ minHeight: '100vh', fontFamily: token.fontFamily }}>
      <Sidebar />
      <AntLayout>
        <Content style={{ margin: '24px', padding: 24, minHeight: 280, borderRadius: token.borderRadius, background: 'transparent' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
