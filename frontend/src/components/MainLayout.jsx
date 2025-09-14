import { useState } from "react";
import CompoundCalculator from "./CompoundCalculator";
import "./MainLayout.css";

function MainLayout() {
  const [currentPage, setCurrentPage] = useState("calculator");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [

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

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleMenuItemClick = (itemId) => {
    setCurrentPage(itemId);
    setSidebarOpen(false);
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="main-header">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={toggleSidebar}
            type="button"
            aria-label="Toggle menu"
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          <h1 className="app-title">🚀 Sistema de Gestão</h1>
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
                    onClick={() => handleMenuItemClick(item.id)}
                    type="button"
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
      {sidebarOpen && (
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        ></div>
      )}

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