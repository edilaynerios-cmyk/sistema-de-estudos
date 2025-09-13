import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Tabs, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { authService } from '../services/api';

const { Title } = Typography;
const { TabPane } = Tabs;

const Auth = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    setMessage('');
    const isLogin = activeTab === '1';

    try {
      if (isLogin) {
        // --- Lógica de Login ---
        const response = await authService.login(values.email, values.password);
        
        // <<< NOSSO ESPIÃO ESTÁ AQUI >>>
        // Ele vai nos mostrar a resposta exata do servidor.
        console.log('Resposta recebida do backend:', response.data);

        // O código tenta salvar os tokens a partir da resposta
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user_id', response.data.user_id);
        
        onLogin(); // Avisa o App.js que o login foi bem-sucedido

      } else {
        // --- Lógica de Cadastro ---
        await authService.signup(values.email, values.password);
        setMessage('Conta criada com sucesso! Por favor, faça o login.');
        setActiveTab('1'); // Muda para a aba de login
        form.resetFields();
      }
    } catch (err) {
      console.error("Ocorreu um erro:", err);
      setError(err.response?.data?.detail || 'Ocorreu um erro. Verifique o console do backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Space direction="vertical" align="center" style={{ width: '100%', marginBottom: 24 }}>
          <BookOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={3}>Sistema de Estudos</Title>
        </Space>

        {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 24 }} />}
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
        
        <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setError(''); form.resetFields(); }}>
          <TabPane tab="Entrar" key="1" />
          <TabPane tab="Criar Conta" key="2" />
        </Tabs>
        
        <Form form={form} onFinish={handleSubmit} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: 'Por favor, insira seu email!' }, { type: 'email', message: 'Email inválido!' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {activeTab === '1' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Auth;