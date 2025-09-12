import React from "react";
import "./Menu.css";

function Menu() {
  return (
    <nav className="menu">
      <ul>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">Funcionalidade 1</a>
        </li>
        <li>
          <a href="#">Funcionalidade 2</a>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;