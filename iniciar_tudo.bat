@echo off
title Lançador - Sistema de Estudos

echo.
echo ============================================
echo    INICIANDO O SISTEMA DE ESTUDOS
echo ============================================
echo.
echo Iniciando o servidor Backend (Python)...
echo.

:: Este comando abre uma NOVA janela de terminal, ativa o ambiente virtual,
:: entra na pasta backend e inicia o servidor uvicorn.
start "Backend Server (Python)" cmd /k "venv\Scripts\activate && cd backend && uvicorn main:app --reload --port 8001"

echo Aguardando 5 segundos para o backend estabilizar...
echo.

:: Este comando espera 5 segundos antes de continuar
timeout /t 5 >nul

echo Iniciando o servidor Frontend (React)...
echo.

:: Este comando abre uma SEGUNDA janela de terminal,
:: entra na pasta frontend e inicia o servidor React.
start "Frontend Server (React)" cmd /k "cd frontend && npm start"

echo ============================================
echo    Servidores iniciados com sucesso!
echo ============================================
echo.
echo O site deve abrir no seu navegador em breve.
echo Voce pode fechar esta janela preta principal.
echo.

pause