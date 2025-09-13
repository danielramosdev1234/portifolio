import { useEffect, useState } from "react";
import axios from "axios";
import "./UserManager.css";

function UserManager() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      setLoading(true);
      await axios.post(API_URL, { name, email });
      setName("");
      setEmail("");
      loadUsers();
    } catch (error) {
      alert("Erro ao adicionar usuário");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id) => {
    const user = users.find(u => u.id === id);
    const newName = prompt("Novo nome:", user.name);
    const newEmail = prompt("Novo email:", user.email);
    
    if (newName && newEmail) {
      try {
        setLoading(true);
        await axios.put(`${API_URL}/${id}`, { name: newName, email: newEmail });
        loadUsers();
      } catch (error) {
        alert("Erro ao atualizar usuário");
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/${id}`);
        loadUsers();
      } catch (error) {
        alert("Erro ao excluir usuário");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-manager">
      <div className="user-manager-header">
        <div className="page-info">
          <h1 className="page-title">👥 Gerenciamento de Usuários</h1>
          <p className="page-subtitle">Gerencie todos os usuários do sistema</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={loadUsers} 
            className="refresh-btn"
            disabled={loading}
          >
            🔄 {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {/* Formulário de Adicionar */}
      <section className="add-user-section">
        <div className="section-header">
          <h2 className="section-title">➕ Adicionar Novo Usuário</h2>
        </div>
        
        <div className="add-user-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="name">Nome Completo</label>
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
            
            <div className="input-group">
              <label>&nbsp;</label>
              <button 
                onClick={addUser} 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Adicionando..." : "➕ Adicionar"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Usuários */}
      <section className="users-list-section">
        <div className="section-header">
          <div className="section-info">
            <h2 className="section-title">📋 Lista de Usuários</h2>
            <span className="users-count">({filteredUsers.length} usuários)</span>
          </div>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <p>🔍 Nenhum usuário encontrado para "{searchTerm}"</p>
                <button onClick={() => setSearchTerm("")} className="btn btn-secondary">
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <p>📝 Nenhum usuário cadastrado ainda.</p>
                <p>Use o formulário acima para adicionar o primeiro usuário!</p>
              </>
            )}
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <span className="user-id">#{user.id}</span>
                    </td>
                    <td>
                      <span className="user-name">{user.name}</span>
                    </td>
                    <td>
                      <span className="user-email">{user.email}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => updateUser(user.id)}
                          className="btn btn-edit"
                          title="Editar usuário"
                          disabled={loading}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="btn btn-delete"
                          title="Excluir usuário"
                          disabled={loading}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserManager;