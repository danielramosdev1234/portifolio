import React from 'react';
import { LanguageProvider } from './components/LanguageContext';
import MainLayout from './components/MainLayout';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <MainLayout />
      </div>
    </LanguageProvider>
  );
}

export default App;