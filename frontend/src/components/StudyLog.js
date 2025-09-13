import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, Typography, notification, Card, Space } from 'antd';
import { studyService } from '../services/api';
import { useInterval } from '../hooks/useInterval';

const { Title, Text } = Typography;
const { Option } = Select;

const StudyLog = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timer, setTimer] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useInterval(() => {
    setTimer(t => t - 1);
  }, isActive && timer > 0 ? 1000 : null);

  useEffect(() => {
    if (timer <= 0 && isActive) {
      setIsActive(false);
      const alarmSound = new Audio('/alarm.mp3');
      alarmSound.play().catch(e => console.log("Erro ao tocar o som:", e)); // Adicionado .catch para evitar erros
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (!isBreak) {
        notification.success({ message: 'Foco Finalizado!', description: `Hora de uma pausa de ${breakDuration} minutos.` });
        form.setFieldsValue({ minutes_total: focusDuration });
        setIsBreak(true);
        setTimer(breakDuration * 60);
      } else {
        notification.info({ message: 'Pausa Finalizada!', description: 'Vamos para mais um ciclo de foco.' });
        setIsBreak(false);
        setTimer(focusDuration * 60);
      }
    }
  }, [timer, isActive, isBreak, form, focusDuration, breakDuration]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimer(focusDuration * 60);
  };
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await studyService.createStudySession(values);
      notification.success({ message: 'Sucesso!', description: 'Sua sessão de estudo foi registrada.' });
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Erro ao registrar', description: 'Não foi possível salvar sua sessão.' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleFocusDurationChange = (value) => {
    const newDuration = value || 1;
    setFocusDuration(newDuration);
    if (!isActive && !isBreak) {
      setTimer(newDuration * 60);
    }
  };

  const handleBreakDurationChange = (value) => {
    const newDuration = value || 1;
    setBreakDuration(newDuration);
    if (!isActive && isBreak) {
      setTimer(newDuration * 60);
    }
  };

  return (
    <div className={isShaking ? 'screen-shake' : ''}>
      <Card style={{ marginBottom: 24 }} bodyStyle={{ backgroundColor: isBreak ? '#e6f7ff' : '#fffbe6' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>{isBreak ? '☕ Em Pausa' : '🎯 Em Foco'}</Title>
          <Text key={timer} style={{ fontSize: '48px', fontFamily: 'monospace' }}>{formatTime(timer)}</Text>
          <div style={{ marginTop: 16 }}>
            <Space>
              <Button type="primary" size="large" onClick={toggleTimer}>{isActive ? 'Pausar' : 'Iniciar'}</Button>
              <Button size="large" onClick={resetTimer}>Resetar</Button>
            </Space>
          </div>
        </div>
        <Space style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Text>Foco (min):</Text>
          <InputNumber min={1} value={focusDuration} onChange={handleFocusDurationChange} disabled={isActive} />
          <Text>Pausa (min):</Text>
          <InputNumber min={1} value={breakDuration} onChange={handleBreakDurationChange} disabled={isActive} />
        </Space>
      </Card>
      
      <Title level={2} style={{ marginTop: 40 }}>Ou registre uma sessão manualmente</Title>
      
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" initialValues={{ type: 'Teoria' }}>
        <Form.Item label="Matéria" name="subject_name" rules={[{ required: true, message: 'Por favor, insira o nome da matéria!' }]}><Input placeholder="Ex: Direito Constitucional" /></Form.Item>
        <Form.Item label="Tipo de Estudo" name="type" rules={[{ required: true, message: 'Por favor, selecione o tipo de estudo!' }]}><Select><Option value="Teoria">Teoria</Option><Option value="Questões">Questões</Option><Option value="Revisão">Revisão</Option><Option value="Lei Seca">Lei Seca</Option><Option value="Jurisprudência">Jurisprudência</Option></Select></Form.Item>
        <Form.Item label="Duração (em minutos)" name="minutes_total" rules={[{ required: true, message: 'Por favor, insira a duração!' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="Total de Questões (opcional)" name="questions_total"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="Questões Corretas (opcional)" name="questions_right"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="Anotações (opcional)" name="notes"><Input.TextArea rows={4} placeholder="Algum tópico importante para revisar?" /></Form.Item>
        <Form.Item><Button type="primary" htmlType="submit" loading={loading}>Salvar Sessão</Button></Form.Item>
      </Form>
    </div>
  );
};

export default StudyLog;