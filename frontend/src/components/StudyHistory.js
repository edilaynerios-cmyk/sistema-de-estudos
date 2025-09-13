import React, { useState, useEffect } from 'react';
import { List, Button, Modal, Form, Input, Select, InputNumber, Typography, Popconfirm, message, Spin, DatePicker, Descriptions, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { studyService } from '../services/api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const StudyHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [form] = Form.useForm();

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await studyService.getStudySessions();
            setSessions(response.data);
        } catch (error) {
            message.error("Erro ao carregar o histórico.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const showEditModal = (session) => {
        setEditingSession(session);
        // Importante: garantir que a data seja um objeto dayjs para o DatePicker funcionar
        form.setFieldsValue({ ...session, date: dayjs(session.date) });
        setIsModalVisible(true);
    };

    const handleDelete = async (sessionId) => {
        try {
            await studyService.deleteStudySession(sessionId);
            message.success("Sessão apagada com sucesso!");
            fetchSessions();
        } catch (error) {
            message.error("Erro ao apagar a sessão.");
        }
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            // Formata a data para o backend
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD')
            };
            try {
                await studyService.updateStudySession(editingSession.id, payload);
                message.success("Sessão atualizada com sucesso!");
                setIsModalVisible(false);
                fetchSessions();
            } catch (error) {
                message.error("Erro ao atualizar a sessão.");
            }
        });
    };
    
    if (loading) return <div style={{textAlign: 'center', margin: '50px 0'}}><Spin size="large" /></div>;

    return (
        <div>
            <Title level={2}>Histórico de Estudos</Title>
            <List
                itemLayout="horizontal"
                dataSource={sessions}
                expandable={{
                    expandedRowRender: session => (
                        <Descriptions bordered column={1} size="small" style={{backgroundColor: '#fafafa'}}>
                            {session.questions_total > 0 && (
                                <Descriptions.Item label="Questões">
                                    <Text>{`${session.questions_right} / ${session.questions_total} `}</Text>
                                    <Tag color="blue">{`${((session.questions_right / session.questions_total) * 100).toFixed(1)}% de acerto`}</Tag>
                                </Descriptions.Item>
                            )}
                            {session.notes && (
                                <Descriptions.Item label="Anotações">
                                    <Paragraph style={{whiteSpace: 'pre-wrap', margin: 0}}>{session.notes}</Paragraph>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    ),
                    rowExpandable: session => session.notes || (session.questions_total && session.questions_total > 0),
                }}
                renderItem={(session) => (
                    <List.Item
                        actions={[
                            <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(session)} />,
                            <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(session.id)} okText="Sim" cancelText="Não">
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>,
                        ]}
                    >
                        <List.Item.Meta
                            title={`${session.subject_name} (${session.type})`}
                            description={`Em ${dayjs(session.date).format('DD/MM/YYYY')} - ${session.minutes_total} minutos`}
                        />
                    </List.Item>
                )}
            />
            <Modal title="Editar Sessão de Estudo" open={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)} destroyOnClose>
                <Form form={form} layout="vertical">
                    {/* --- CAMPO DE DATA ADICIONADO --- */}
                    <Form.Item label="Data do Estudo" name="date" rules={[{ required: true, message: 'Insira a data!' }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    
                    <Form.Item label="Matéria" name="subject_name" rules={[{ required: true, message: 'Insira a matéria!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tipo" name="type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Teoria">Teoria</Option>
                            <Option value="Questões">Questões</Option>
                            <Option value="Revisão">Revisão</Option>
                            <Option value="Lei Seca">Lei Seca</Option>
                            <Option value="Jurisprudência">Jurisprudência</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Duração (minutos)" name="minutes_total" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Total de Questões" name="questions_total">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Questões Corretas" name="questions_right">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Anotações" name="notes">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


export default StudyHistory;