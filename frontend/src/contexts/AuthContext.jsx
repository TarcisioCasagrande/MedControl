import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('controlmed_token');
    const usuarioSalvo = localStorage.getItem('controlmed_usuario');

    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setCarregando(false);
  }, []);

  async function login(email, senha) {
    const resposta = await api.post('/auth/login', {
      email,
      senha,
    });

    const dadosUsuario = {
      id: resposta.data.usuarioId,
      nome: resposta.data.nome,
      email: resposta.data.email,
      perfil: resposta.data.perfil,
    };

    localStorage.setItem('controlmed_token', resposta.data.token);
    localStorage.setItem('controlmed_usuario', JSON.stringify(dadosUsuario));

    setUsuario(dadosUsuario);

    return dadosUsuario;
  }

  function logout() {
    localStorage.removeItem('controlmed_token');
    localStorage.removeItem('controlmed_usuario');
    setUsuario(null);
    window.location.href = '/login';
  }

  function temPerfil(perfisPermitidos) {
    if (!usuario) return false;
    return perfisPermitidos.includes(usuario.perfil);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        temPerfil,
        carregando,
        autenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}