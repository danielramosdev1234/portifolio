import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Menu />
        <div style={{ flex: 1, padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Rotas futuras podem ser adicionadas aqui */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;