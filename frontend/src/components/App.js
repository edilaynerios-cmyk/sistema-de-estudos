import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Layout from './Layout';
import Dashboard from './Dashboard';
import StudyLog from './StudyLog';
import Reviews from './Reviews';
import Cycles from './Cycles';
import StudyHistory from './StudyHistory';
import SubjectPage from './SubjectPage';
import SubjectListPage from './SubjectListPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Auth onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/" element={<Layout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="study-log" element={<StudyLog />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="cycles" element={<Cycles />} />
            <Route path="history" element={<StudyHistory />} />
	    <Route path="subjects" element={<SubjectListPage />} />
            <Route path="subject/:subjectName" element={<SubjectPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;