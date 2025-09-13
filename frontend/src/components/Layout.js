import React from 'react';
import { Layout as AntLayout, Menu, Button } from 'antd';
import { DashboardOutlined, PlusCircleOutlined, SyncOutlined, RetweetOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { /*...,*/ AppstoreOutlined } from '@ant-design/icons'; 

const { Sider, Content, Header } = AntLayout;

const Layout = ({ onLogout }) => {
  const location = useLocation();

const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/subjects', icon: <AppstoreOutlined />, label: <Link to="/subjects">Minhas Matérias</Link> }, // <-- NOVA LINHA
    { key: '/study-log', icon: <PlusCircleOutlined />, label: <Link to="/study-log">Registrar Estudo</Link> },
    { key: '/reviews', icon: <SyncOutlined />, label: <Link to="/reviews">Revisões</Link> },
    { key: '/cycles', icon: <RetweetOutlined />, label: <Link to="/cycles">Gerenciar Ciclos</Link> },
    { key: '/history', icon: <HistoryOutlined />, label: <Link to="/history">Histórico</Link> },
];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 64 }} />
        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button icon={<LogoutOutlined />} onClick={onLogout}>Sair</Button>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ background: '#fff', minHeight: 'calc(100vh - 112px)', padding: 24 }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;