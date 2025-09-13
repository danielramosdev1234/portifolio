import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8080/api/users";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (error) {
      alert("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await axios.post(API_URL, { name, email });
      setName("");
      setEmail("");
      loadUsers();
    } catch (error) {
      alert("Erro ao adicionar usuário");
    }
  };

  const updateUser = async (id) => {
    const user = users.find(u => u.id === id);
    const newName = prompt("Novo nome:", user.name);
    const newEmail = prompt("Novo email:", user.email);

    if (newName && newEmail) {
      try {
        await axios.put(`${API_URL}/${id}`, { name: newName, email: newEmail });
        loadUsers();
      } catch (error) {
        alert("Erro ao atualizar usuário");
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        loadUsers();
      } catch (error) {
        alert("Erro ao excluir usuário");
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚀 Gerenciamento de Usuários</h1>
        <p>Sistema CRUD com Java Spring Boot + React</p>
      </header>

      <main className="main-content">
        {/* Formulário de Adicionar */}
        <section className="form-section">
          <h2>✨ Adicionar Novo Usuário</h2>
          <div className="form-container">
            <div className="input-group">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                placeholder="Digite o nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Digite o email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              onClick={addUser}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "⏳ Adicionando..." : "➕ Adicionar Usuário"}
            </button>
          </div>
        </section>

        {/* Lista de Usuários */}
        <section className="users-section">
          <div className="section-header">
            <h2>👥 Lista de Usuários ({users.length})</h2>
            <button
              onClick={loadUsers}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? "⏳" : "🔄 Atualizar"}
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>📝 Nenhum usuário cadastrado ainda.</p>
              <p>Adicione o primeiro usuário usando o formulário acima!</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <span className="user-id">ID: {user.id}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <button
                      onClick={() => updateUser(user.id)}
                      className="btn btn-edit"
                      title="Editar usuário"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="btn btn-delete"
                      title="Excluir usuário"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>💡 Sistema desenvolvido com Spring Boot + React</p>
      </footer>
    </div>
  );
}

export default App;