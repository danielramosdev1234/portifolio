import React, { useState } from "react";
import CompoundCalculator from "./CompoundCalculator";
import FixedIncomeComparator from "./FixedIncomeComparator";
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
      id: "comparator",
      label: texts.fixedIncomeComparator,
      icon: "📊",
      component: <FixedIncomeComparator />
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
          {/* Botão de troca de idioma estilo toggle switch */}
          <div className="language-toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: '600',
              opacity: language === 'en' ? 1 : 0.6,
              transition: 'opacity 0.3s ease'
            }}>
              EN
            </span>

            <button
              className="language-toggle"
              onClick={handleLanguageToggle}
              type="button"
              aria-label="Toggle language"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '25px',
                padding: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '60px',
                height: '32px',
                position: 'relative',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div
                className="toggle-slider"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transform: language === 'pt' ? 'translateX(28px)' : 'translateX(0)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  position: 'relative'
                }}
              >
                {language === 'pt' ? '🇵🇹' : '🇬🇧'}
              </div>
            </button>

            <span style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: '600',
              opacity: language === 'pt' ? 1 : 0.6,
              transition: 'opacity 0.3s ease'
            }}>
              PT
            </span>
          </div>


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