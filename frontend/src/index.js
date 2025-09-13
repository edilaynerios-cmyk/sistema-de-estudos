import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css'; // Importa os estilos da biblioteca Ant Design
import './index.css';
import App from './components/App'; // Vamos criar este arquivo a seguir

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);