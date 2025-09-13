import { useState } from "react";
import UserManager from "./UserManager";
import Dashboard from "./Dashboard";
import CompoundCalculator from "./CompoundCalculator";
import "./MainLayout.css";

function MainLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      component: <Dashboard />
    },
    {
      id: "users",
      label: "Usuários",
      icon: "👥",
      component: <UserManager />
    },
    {
      id: "calculator",
      label: "Calculadora",
      icon: "🧮",
      component: <CompoundCalculator />
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: "📈",
      component: <div className="coming-soon">📊 Em breve...</div>
    },
    {
      id: "settings",
      label: "Configurações",
      icon: "⚙️",
      component: <div className="coming-soon">⚙️ Em breve...</div>
    }
  ];

  const currentComponent = menuItems.find(item => item.id === currentPage)?.component;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="main-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          <h1 className="app-title">🚀 Sistema de Gestão</h1>
        </div>
        
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Menu Principal</h3>
            <ul className="nav-list">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    className={`nav-item ${currentPage === item.id ? 'nav-item-active' : ''}`}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-footer">
            <div className="version-info">
              <p>Versão 1.0.0</p>
              <p>Spring Boot + React</p>
            </div>
          </div>
        </nav>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="content-wrapper">
          {currentComponent}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;