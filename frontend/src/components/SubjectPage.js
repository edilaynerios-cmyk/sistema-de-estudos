import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { subjectService } from '../services/api';
import { Typography, Spin, Row, Col, Card, Statistic, List, Tag, message, Empty } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

const SubjectPage = () => {
    const { subjectName } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await subjectService.getSubjectDetails(decodeURIComponent(subjectName));
                setDetails(response.data);
            } catch (error) {
                message.error("Erro ao carregar os detalhes da matéria.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [subjectName]);

    if (loading) return <div style={{textAlign: 'center', margin: '50px 0'}}><Spin size="large" /></div>;
    if (!details) return <Empty description="Não foram encontrados dados para esta matéria." />;

    return (
        <div>
            <Title level={2}>{decodeURIComponent(subjectName)}</Title>
            
            <Title level={4} style={{marginTop: 32}}>Estatísticas Gerais</Title>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={6}><Card><Statistic title="Minutos Totais" value={details.stats.total_minutes} /></Card></Col>
                <Col xs={24} sm={12} md={6}><Card><Statistic title="Questões Feitas" value={details.stats.total_questions} /></Card></Col>
                <Col xs={24} sm={12} md={6}><Card><Statistic title="Acertos" value={details.stats.total_correct} /></Card></Col>
                <Col xs={24} sm={12} md={6}><Card><Statistic title="Taxa de Acerto" value={details.stats.accuracy} suffix="%" /></Card></Col>
            </Row>

            <Title level={4} style={{marginTop: 32}}>Histórico de Sessões</Title>
            <List
                bordered
                dataSource={details.sessions}
                renderItem={session => (
                    <List.Item>
                        <List.Item.Meta
                            title={`${session.type} - ${dayjs(session.date).format('DD/MM/YYYY')}`}
                            description={`${session.minutes_total} minutos. ${session.notes ? `Anotações: ${session.notes}`: ''}`}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: "Nenhuma sessão de estudo registrada para esta matéria." }}
            />
            
            <Title level={4} style={{marginTop: 32}}>Revisões Agendadas</Title>
            <List
                bordered
                dataSource={details.reviews}
                renderItem={review => (
                    <List.Item>
                        <List.Item.Meta
                            title={`Vencimento: ${dayjs(review.due_date).format('DD/MM/YYYY')}`}
                            description={`Origem do estudo: ${dayjs(review.origin_date).format('DD/MM/YYYY')}`}
                        />
                        <Tag color={review.status === 'pending' ? 'blue' : 'success'}>{review.status}</Tag>
                    </List.Item>
                )}
                 locale={{ emptyText: "Nenhuma revisão agendada para esta matéria." }}
            />
        </div>
    );
};
export default SubjectPage;