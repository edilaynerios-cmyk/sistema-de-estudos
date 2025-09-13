import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, Typography, Spin, message, Input } from 'antd';
import { subjectService } from '../services/api';

const { Title, Text } = Typography;
const { Search } = Input;

const SubjectListPage = () => {
    const [allSubjects, setAllSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const response = await subjectService.getAllSubjects();
                setAllSubjects(response.data);
                setFilteredSubjects(response.data);
            } catch (error) {
                message.error("Erro ao carregar a lista de matérias.");
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const handleSearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = allSubjects.filter(subject =>
            subject.toLowerCase().includes(lowercasedValue)
        );
        setFilteredSubjects(filtered);
    };

    if (loading) {
        return <div style={{textAlign: 'center', margin: '50px 0'}}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Todas as Matérias</Title>
            <Search
                placeholder="Buscar matéria..."
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 24 }}
                allowClear
            />
            <List
                bordered
                dataSource={filteredSubjects}
                renderItem={(subject) => (
                    <List.Item>
                        <Link to={`/subject/${encodeURIComponent(subject)}`}>
                            <Text strong>{subject}</Text>
                        </Link>
                    </List.Item>
                )}
                locale={{ emptyText: "Nenhuma matéria encontrada." }}
            />
        </div>
    );
};

export default SubjectListPage;