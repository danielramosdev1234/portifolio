import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    systemHealth: "Excelente"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/users");
      const users = response.data;
      
      setStats({
        totalUsers: users.length,
        activeUsers: users.length,
        newUsersThisMonth: Math.floor(users.length * 0.3), // Simulação
        systemHealth: "Excelente"
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        systemHealth: "Erro de Conexão"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-value">{loading ? "..." : value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, description, onClick, color }) => (
    <button className={`quick-action quick-action-${color}`} onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h4 className="action-title">{title}</h4>
        <p className="action-description">{description}</p>
      </div>
    </button>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="page-title">🏠 Dashboard</h1>
          <p className="page-subtitle">Bem-vindo ao seu sistema de gestão</p>
        </div>
        
        <div className="dashboard-actions">
          <button className="refresh-btn" onClick={loadDashboardData} disabled={loading}>
            🔄 {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <section className="stats-section">
        <h2 className="section-title">📈 Estatísticas Gerais</h2>
        <div className="stats-grid">
          <StatCard
            icon="👥"
            title="Total de Usuários"
            value={stats.totalUsers}
            color="blue"
            subtitle="Usuários cadastrados"
          />
          <StatCard
            icon="✅"
            title="Usuários Ativos"
            value={stats.activeUsers}
            color="green"
            subtitle="Online agora"
          />
          <StatCard
            icon="🆕"
            title="Novos este Mês"
            value={stats.newUsersThisMonth}
            color="purple"
            subtitle="Crescimento mensal"
          />
          <StatCard
            icon="💚"
            title="Status do Sistema"
            value={stats.systemHealth}
            color="success"
            subtitle="Todos os serviços"
          />
        </div>
      </section>

      {/* Ações Rápidas */}
      <section className="quick-actions-section">
        <h2 className="section-title">⚡ Ações Rápidas</h2>
        <div className="quick-actions-grid">
          <QuickAction
            icon="➕"
            title="Adicionar Usuário"
            description="Cadastrar um novo usuário no sistema"
            color="blue"
            onClick={() => alert("Acesse a seção de Usuários no menu lateral")}
          />
          <QuickAction
            icon="📊"
            title="Ver Relatórios"
            description="Acessar relatórios detalhados"
            color="green"
            onClick={() => alert("Em breve!")}
          />
          <QuickAction
            icon="🔧"
            title="Configurações"
            description="Ajustar configurações do sistema"
            color="orange"
            onClick={() => alert("Em breve!")}
          />
          <QuickAction
            icon="🔍"
            title="Logs do Sistema"
            description="Visualizar logs de atividade"
            color="purple"
            onClick={() => alert("Em breve!")}
          />
        </div>
      </section>

      {/* Atividade Recente */}
      <section className="activity-section">
        <h2 className="section-title">📋 Atividade Recente</h2>
        <div className="activity-feed">
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <p className="activity-text">Sistema iniciado com sucesso</p>
              <span className="activity-time">Agora mesmo</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">💾</div>
            <div className="activity-content">
              <p className="activity-text">Banco de dados conectado</p>
              <span className="activity-time">2 minutos atrás</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">🔄</div>
            <div className="activity-content">
              <p className="activity-text">Dashboard atualizado</p>
              <span className="activity-time">5 minutos atrás</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;