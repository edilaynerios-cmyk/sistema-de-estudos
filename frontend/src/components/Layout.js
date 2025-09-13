import React from 'react';
import { Layout as AntLayout, Menu, Button, Popconfirm, message } from 'antd';
import { 
    DashboardOutlined, 
    PlusCircleOutlined, 
    SyncOutlined, 
    RetweetOutlined, 
    HistoryOutlined, 
    AppstoreOutlined 
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { userService } from '../services/api';

const { Sider, Content, Header } = AntLayout;

const Layout = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/subjects', icon: <AppstoreOutlined />, label: <Link to="/subjects">Minhas Matérias</Link> },
    { key: '/study-log', icon: <PlusCircleOutlined />, label: <Link to="/study-log">Registrar Estudo</Link> },
    { key: '/reviews', icon: <SyncOutlined />, label: <Link to="/reviews">Revisões</Link> },
    { key: '/cycles', icon: <RetweetOutlined />, label: <Link to="/cycles">Gerenciar Ciclos</Link> },
    { key: '/history', icon: <HistoryOutlined />, label: <Link to="/history">Histórico</Link> },
  ];

  const handleDeleteAccount = async () => {
    try {
        await userService.deleteAccount();
        message.success('Sua conta foi excluída com sucesso.');
        onLogout();
    } catch (error) {
        message.error('Ocorreu um erro ao excluir sua conta. Tente novamente.');
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Popconfirm
                title="Excluir sua conta?"
                description="Esta ação é irreversível. Todos os seus dados serão apagados permanentemente. Tem certeza?"
                onConfirm={handleDeleteAccount}
                okText="Sim, excluir minha conta"
                okButtonProps={{ danger: true }}
                cancelText="Não, cancelar"
            >
                <Button danger>Excluir Conta</Button>
            </Popconfirm>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ background: '#fff', minHeight: 'calc(100vh - 112px)', padding: 24 }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout> // <-- Esta é a linha que provavelmente foi apagada
  );
};

export default Layout;