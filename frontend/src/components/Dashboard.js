import React, { useState, useEffect } from 'react';
import { dashboardService, analyticsService } from '../services/api';
import { Row, Col, Card, Typography, Statistic, Spin, List, Tag, Alert } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, FireOutlined, ReadOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardResponse, analyticsResponse] = await Promise.all([
          dashboardService.getDashboard(),
          analyticsService.getSummary()
        ]);
        setDashboardData(dashboardResponse.data);
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard. Tente recarregar a página.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}><Spin size="large" /></div>;
  if (error) return <Alert message="Erro" description={error} type="error" showIcon />;

  // Pega o nome da matéria de hoje para usar no link. Garante que não seja nulo.
  const todaySubject = dashboardData?.today_subject || '';

  return (
    <>
      <Title level={2}>Dashboard</Title>
      <Paragraph type="secondary">Seu progresso recente nos estudos.</Paragraph>
      <Card style={{ marginBottom: 24, backgroundColor: '#e6f7ff' }}>
        <Statistic
          title={<Text style={{fontSize: '16px'}}>📚 Matéria de Hoje</Text>}
          valueRender={() => (
            <Link to={`/subject/${encodeURIComponent(todaySubject)}`}>
              <span style={{ color: '#0050b3', fontSize: '24px' }}>
                {todaySubject || 'Nenhuma matéria definida'}
              </span>
            </Link>
          )}
        />
      </Card>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
         <Col xs={24} sm={12} md={6}><Card><Statistic title="Horas (30 dias)" value={analytics ? Math.round(analytics.total_minutes_30_days / 60) : 0} prefix={<ClockCircleOutlined />} suffix="h" /></Card></Col>
         <Col xs={24} sm={12} md={6}><Card><Statistic title="Taxa de Acerto" value={analytics ? analytics.accuracy_rate : 0} prefix={<CheckCircleOutlined />} suffix="%" /></Card></Col>
         <Col xs={24} sm={12} md={6}><Card><Statistic title="Sequência (dias)" value={analytics ? analytics.study_streak : 0} prefix={<FireOutlined />} /></Card></Col>
         <Col xs={24} sm={12} md={6}><Card><Statistic title="Sessões (30 dias)" value={analytics ? analytics.sessions_count : 0} prefix={<ReadOutlined />} /></Card></Col>
      </Row>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={`🔄 Revisões Pendentes (${dashboardData?.today_reviews?.length || 0})`}>
            <List
              dataSource={dashboardData?.today_reviews}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta avatar={<BookOutlined />} title={item.subject_name} description={`Origem: ${item.origin_date}`} />
                  <Tag color="warning">Pendente</Tag>
                </List.Item>
              )}
              locale={{ emptyText: "Nenhuma revisão para hoje. Bom trabalho!" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
            <Card title="📊 Sessões Recentes">
                <List
                    dataSource={dashboardData?.recent_sessions}
                    renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta title={item.subject_name} description={item.date} />
                        <div>{item.minutes_total} min</div>
                    </List.Item>
                    )}
                    locale={{ emptyText: "Nenhum estudo registrado ainda." }}
                />
            </Card>
        </Col>
      </Row>
    </>
  );
};
export default Dashboard;