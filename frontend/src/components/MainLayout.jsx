import React, { useState } from "react";
import CompoundCalculator from "./CompoundCalculator";
import RetirementCalculator from "./RetirementCalculator";
import { LanguageProvider, useLanguage } from './LanguageContext';
import "./MainLayout.css";

// Componente interno que usa o contexto de idioma
const MainLayoutContent = () => {
  const [currentPage, setCurrentPage] = useState("calculator");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { texts, changeLanguage, language } = useLanguage();

  const menuItems = [
    {
      id: "calculator",
      label: texts.calculator,
      icon: "🧮",
      component: <CompoundCalculator />
    },
    {
      id: "retirement",
      label: texts.retirement,
      icon: "🏖️",
      component: <RetirementCalculator />
    },
    {
      id: "reports",
      label: texts.reports,
      icon: "📈",
      component: <div className="coming-soon">📊 {texts.comingSoon}</div>
    },
    {
      id: "settings",
      label: texts.settings,
      icon: "⚙️",
      component: <div className="coming-soon">⚙️ {texts.comingSoon}</div>
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

  const handleLanguageToggle = () => {
    changeLanguage(language === 'pt' ? 'en' : 'pt');
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
          <h1 className="app-title">{texts.appTitle}</h1>
        </div>

        <div className="header-right">
          {/* Botão de troca de idioma */}
          <button
            className="language-toggle"
            onClick={handleLanguageToggle}
            type="button"
            aria-label="Toggle language"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '10px 16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(15px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              minWidth: '80px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
          >
            <span
              className="language-flag"
              style={{
                fontSize: '20px',
                lineHeight: '1',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                display: 'flex',
                gap: '2px'
              }}
            >
              {language === 'pt' ? (
                <>
                  <span>🇧🇷</span>
                  <span>🇵🇹</span>
                </>
              ) : (
                <>
                  <span>🇺🇸</span>
                  <span>🇬🇧</span>
                </>
              )}
            </span>
            <span
              className="language-code"
              style={{
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              {language === 'pt' ? 'PT' : 'EN'}
            </span>
          </button>


        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">{texts.menuTitle}</h3>
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
              <p>{texts.version}</p>
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
};

// Componente principal que envolve tudo no LanguageProvider
const MainLayout = () => {
  return (
    <LanguageProvider>
      <MainLayoutContent />
    </LanguageProvider>
  );
};

export default MainLayout;