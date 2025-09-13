import React, { useState, useEffect } from 'react';
import { List, Button, Modal, Form, Input, DatePicker, Typography, Popconfirm, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { cycleService } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const Cycles = () => {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCycle, setEditingCycle] = useState(null);
    const [form] = Form.useForm();

    const fetchCycles = async () => {
        try {
            setLoading(true);
            const response = await cycleService.getCycles();
            setCycles(response.data);
        } catch (error) {
            message.error("Erro ao carregar os ciclos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, []);

    const showCreateModal = () => {
        setEditingCycle(null);
        form.resetFields();
        form.setFieldsValue({ start_date: dayjs() });
        setIsModalVisible(true);
    };

    const showEditModal = (cycle) => {
        setEditingCycle(cycle);
        form.setFieldsValue({
            name: cycle.name,
            start_date: dayjs(cycle.start_date),
            subjects: cycle.subjects.join(', '),
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (cycleId) => {
        try {
            await cycleService.deleteCycle(cycleId);
            message.success("Ciclo apagado com sucesso!");
            fetchCycles();
        } catch (error) {
            message.error("Erro ao apagar o ciclo.");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCycle(null);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            const subjects = values.subjects.split(',').map(s => s.trim()).filter(Boolean);
            if (subjects.length === 0) {
                message.warning("Você precisa adicionar pelo menos uma matéria.");
                return;
            }

            const payload = {
                name: values.name,
                start_date: values.start_date.format('YYYY-MM-DD'),
                subjects: subjects
            };
            
            try {
                if (editingCycle) {
                    await cycleService.updateCycle(editingCycle.id, payload);
                    message.success("Ciclo atualizado com sucesso!");
                } else {
                    await cycleService.createCycle(payload);
                    message.success("Ciclo criado com sucesso!");
                }
                handleCancel();
                fetchCycles();
            } catch (error) {
                message.error(`Erro ao ${editingCycle ? 'atualizar' : 'criar'} o ciclo.`);
            }
        });
    };

    if (loading) {
        return <div style={{textAlign: 'center', margin: '50px 0'}}><Spin size="large" /></div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Meus Ciclos de Estudo</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                    Criar Novo Ciclo
                </Button>
            </div>

            <List
                itemLayout="horizontal"
                dataSource={cycles}
                renderItem={(cycle) => (
                    <List.Item
                        actions={[
                            <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(cycle)} />,
                            <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(cycle.id)} okText="Sim" cancelText="Não">
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>,
                        ]}
                    >
                        <List.Item.Meta
                            title={cycle.name}
                            description={`Início em: ${dayjs(cycle.start_date).format('DD/MM/YYYY')} - Matérias: ${cycle.subjects?.length || 0}`}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: "Nenhum ciclo de estudo encontrado. Crie seu primeiro ciclo!" }}
            />

            <Modal
                title={editingCycle ? "Editar Ciclo" : "Criar Novo Ciclo"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={editingCycle ? "Salvar Alterações" : "Criar"}
                cancelText="Cancelar"
                destroyOnClose
            >
                <Form form={form} layout="vertical" name="cycleForm">
                    <Form.Item name="name" label="Nome do Ciclo" rules={[{ required: true, message: 'Por favor, insira um nome.' }]}>
                        <Input placeholder="Ex: Ciclo Magistratura 2025" />
                    </Form.Item>
                    <Form.Item name="start_date" label="Data de Início" rules={[{ required: true, message: 'Por favor, insira a data de início.' }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="subjects" label="Matérias" help="Separe as matérias por vírgula (,)" rules={[{ required: true, message: 'Por favor, insira as matérias.' }]}>
                        <Input.TextArea rows={4} placeholder="Direito Constitucional, Direito Administrativo, Direito Penal..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Cycles;