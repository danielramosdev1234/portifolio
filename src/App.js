import React from "react";
import "./App.css";
import Menu from "./components/Menu";
import Home from "./pages/Home";

function App() {
  return (
    <div className="app-container">
      <Menu />
      <main className="main-content">
        <Home />
      </main>
    </div>
  );
}

export default App;