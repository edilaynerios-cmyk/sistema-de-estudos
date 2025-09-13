# 📚 Sistema de Estudos para Concursos

> Uma aplicação web full-stack completa para gerenciamento e acompanhamento de rotinas de estudo, utilizando o método de repetição espaçada.

Este projeto foi construído do zero, com foco em criar uma ferramenta robusta e prática para estudantes que se preparam para provas e concursos de longo prazo.

## 🚀 Demo Ao Vivo

**Acesse a aplicação em funcionamento:** [https://sistemadeestudos.netlify.app](https://sistemadeestudos.netlify.app)

*(Nota: O backend hospedado no plano gratuito da Render pode "dormir" após 15 minutos de inatividade. O primeiro acesso pode levar cerca de 30-60 segundos para carregar enquanto o servidor "acorda".)*

## 📸 Screenshots

*(Dica: Tire prints das suas telas e substitua os links abaixo)*
| Login | Dashboard | Detalhes da Matéria |
| :---: | :---: | :---: |
| ![Tela de Login](link_para_seu_print_aqui.png) | ![Tela do Dashboard](link_para_seu_print_aqui.png) | ![Página da Matéria](link_para_seu_print_aqui.png) |

## ✨ Funcionalidades

* **Autenticação de Usuário:** Sistema completo de cadastro e login com tokens JWT seguros.
* **Gerenciamento de Ciclos de Estudo:** Crie, edite e apague ciclos de estudo personalizados.
* **Registro de Sessões:** Grave cada sessão de estudo com detalhes como matéria, tipo, duração, anotações e performance em questões.
* **Timer Pomodoro Integrado:** Ferramenta de foco com tempos customizáveis, alertas sonoros e visuais.
* **Revisão Espaçada Automática:** O sistema agenda automaticamente as revisões futuras com base em um algoritmo de repetição espaçada (1, 7, 21, 45, 90, 180 dias).
* **Painel de Revisões:** Visualize e gerencie suas revisões, organizadas por "Atrasadas", "Para Hoje", "Próximas" e "Concluídas".
* **Desfazer Ações:** Marcou uma revisão como concluída por engano? É só desfazer.
* **Páginas Dedicadas por Matéria:** Acesse um dashboard completo para cada matéria, com estatísticas, histórico de sessões e revisões específicas.
* **Histórico Completo:** Visualize, edite ou apague qualquer sessão de estudo já registrada.

## 🛠️ Tecnologias Utilizadas

#### **Frontend (a parte visual)**
* **React:** Biblioteca para construção da interface.
* **React Router:** Para a navegação entre as páginas.
* **Ant Design:** Biblioteca de componentes para um design limpo e profissional.
* **Axios:** Para a comunicação com o backend.

#### **Backend (a lógica)**
* **Python 3:** Linguagem de programação.
* **FastAPI:** Framework web de alta performance para a criação da API.
* **SQLModel:** Para a interação com o banco de dados e validação de dados.
* **PostgreSQL:** Banco de dados relacional.

#### **Deploy (Publicação na Internet)**
* **GitHub:** Para versionamento do código.
* **Netlify:** Hospedagem do frontend.
* **Render:** Hospedagem do backend.
* **Neon:** Hospedagem do banco de dados PostgreSQL.

## 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e rodar o projeto no seu próprio computador.

### Pré-requisitos
* Git
* Python 3.10+
* Node.js e npm
* PostgreSQL

### 1. Clone o Repositório
```bash
git clone [https://github.com/seu-usuario/sistema-de-estudos.git](https://github.com/seu-usuario/sistema-de-estudos.git)
cd sistema-de-estudos