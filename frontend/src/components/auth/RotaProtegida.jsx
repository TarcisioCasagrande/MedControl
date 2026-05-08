import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function RotaProtegida({ children, perfis }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <div style={{ padding: '24px' }}>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (perfis && !perfis.includes(usuario.perfil)) {
    return <Navigate to="/sem-acesso" replace />;
  }

  return children;
}

export default RotaProtegida;