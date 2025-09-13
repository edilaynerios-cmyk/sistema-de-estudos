import React, { useState, useEffect } from 'react';
import { List, Button, Typography, message, Spin, Tabs, Empty } from 'antd';
import { CheckCircleOutlined, UndoOutlined } from '@ant-design/icons';
import { reviewService } from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import isToday from 'dayjs/plugin/isToday';

dayjs.locale('pt-br');
dayjs.extend(isToday);

const { Title } = Typography;
const { TabPane } = Tabs;

const Reviews = () => {
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewService.getReviews();
            setAllReviews(response.data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
        } catch (error) {
            message.error("Erro ao carregar as revisões.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleComplete = async (reviewId) => {
        try {
            await reviewService.completeReview(reviewId);
            message.success("Revisão concluída!");
            fetchReviews();
        } catch (error) {
            message.error("Erro ao concluir a revisão.");
        }
    };
    
    const handleUndo = async (reviewId) => {
        try {
            await reviewService.undoReview(reviewId);
            message.success("Revisão revertida para pendente!");
            fetchReviews();
        } catch (error) {
            message.error("Erro ao reverter a revisão.");
        }
    };

    const renderPendingList = (reviews) => {
        if (reviews.length === 0) return <Empty description="Nenhuma revisão nesta categoria." />;
        
        return (
            <List
                dataSource={reviews}
                renderItem={(review) => (
                    <List.Item
                        actions={[
                            <Button type="text" icon={<CheckCircleOutlined style={{color: 'green'}}/>} onClick={() => handleComplete(review.id)}>
                                Marcar como concluída
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={review.subject_name}
                            description={`Estudado em: ${dayjs(review.origin_date).format('DD/MM/YYYY')} - Vencimento: ${dayjs(review.due_date).format('DD/MM/YYYY')}`}
                        />
                    </List.Item>
                )}
            />
        );
    };
    
    const renderDoneList = (reviews) => {
        if (reviews.length === 0) return <Empty description="Nenhuma revisão nesta categoria." />;

        return (
            <List
                dataSource={reviews}
                renderItem={(review) => (
                    <List.Item
                        actions={[
                            <Button type="text" icon={<UndoOutlined />} onClick={() => handleUndo(review.id)}>
                                Desfazer
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={review.subject_name}
                            description={`Concluída em: ${dayjs(review.done_at).format('DD/MM/YYYY HH:mm')}`}
                        />
                    </List.Item>
                )}
            />
        );
    };

    const pendingReviews = allReviews.filter(r => r.status === 'pending');
    const doneReviews = allReviews.filter(r => r.status === 'done').sort((a, b) => new Date(b.done_at) - new Date(a.done_at));
    
    const overdueReviews = pendingReviews.filter(r => dayjs(r.due_date).isBefore(dayjs(), 'day'));
    const todayReviews = pendingReviews.filter(r => dayjs(r.due_date).isToday());
    const upcomingReviews = pendingReviews.filter(r => dayjs(r.due_date).isAfter(dayjs(), 'day'));

    if (loading) {
        return <div style={{textAlign: 'center', margin: '50px 0'}}><Spin size="large" /></div>;
    }
    
    return (
        <div>
            <Title level={2}>Painel de Revisões</Title>
            <Tabs defaultActiveKey="1">
                <TabPane tab={`Para Hoje (${todayReviews.length})`} key="1">
                    {renderPendingList(todayReviews)}
                </TabPane>
                <TabPane tab={`Atrasadas (${overdueReviews.length})`} key="2">
                    {renderPendingList(overdueReviews)}
                </TabPane>
                <TabPane tab={`Próximas (${upcomingReviews.length})`} key="3">
                    {renderPendingList(upcomingReviews)}
                </TabPane>
                <TabPane tab={`Concluídas (${doneReviews.length})`} key="4">
                    {renderDoneList(doneReviews)}
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Reviews;