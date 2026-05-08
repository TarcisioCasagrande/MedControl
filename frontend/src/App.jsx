import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RotaProtegida from './components/auth/RotaProtegida';

import Layout from './components/layout/Layout';

import LoginPage from './components/auth/LoginPage';
import SemAcessoPage from './components/auth/SemAcessoPage';

import DashboardPage from './components/dashboard/DashboardPage';
import UsuariosPage from './components/usuarios/UsuariosPage';
import MedicosPage from './components/medicos/MedicosPage';
import PacientesPage from './components/pacientes/PacientesPage';
import AgendamentosPage from './components/agendamentos/AgendamentosPage';
import ProntuariosPage from './components/prontuarios/ProntuariosPage';
import AgendaPage from './components/agenda/AgendaPage';
import PagamentosPage from './components/pagamentos/PagamentosPage';
import ProcedimentosPage from './components/procedimentos/ProcedimentosPage';
import AssistenteIaPage from './components/assistente-ia/AssistenteIaPage';
import MedicoAtendimentosPage from './components/medico-atendimentos/MedicoAtendimentosPage';

import DisponibilidadeMedicoPage from './components/disponibilidade-medico/DisponibilidadeMedicoPage';

import RelatorioMinutosPage from './components/relatorios/RelatorioMinutosPage';
import RelatorioPagamentosPage from './components/relatorios/RelatorioPagamentosPage';
import AgendamentosPorUsuarioPage from './components/relatorios/AgendamentosPorUsuarioPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sem-acesso" element={<SemAcessoPage />} />

        <Route
          element={
            <RotaProtegida>
              <Layout />
            </RotaProtegida>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista', 'Medico']}>
                <DashboardPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/usuarios"
            element={
              <RotaProtegida perfis={['Admin']}>
                <UsuariosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/agenda"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista', 'Medico']}>
                <AgendaPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/disponibilidade-medico"
            element={
              <RotaProtegida perfis={['Admin', 'Medico']}>
                <DisponibilidadeMedicoPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/procedimentos"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista']}>
                <ProcedimentosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/medicos"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista']}>
                <MedicosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/pacientes"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista', 'Medico']}>
                <PacientesPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/agendamentos"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista', 'Medico']}>
                <AgendamentosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/medico/atendimentos"
            element={
              <RotaProtegida perfis={['Medico']}>
                <MedicoAtendimentosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/prontuarios"
            element={
              <RotaProtegida perfis={['Admin', 'Medico']}>
                <ProntuariosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/pagamentos"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista']}>
                <PagamentosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/relatorios/minutos"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista']}>
                <RelatorioMinutosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/relatorios/pagamentos"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista']}>
                <RelatorioPagamentosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/relatorios/agendamentos-usuario"
            element={
              <RotaProtegida perfis={['Admin', 'Recepcionista']}>
                <AgendamentosPorUsuarioPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/assistente-ia"
            element={
              <RotaProtegida perfis={['Admin', 'Medico']}>
                <AssistenteIaPage />
              </RotaProtegida>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;