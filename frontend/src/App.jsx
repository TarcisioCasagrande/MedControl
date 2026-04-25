import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

import MedicosPage from './components/medicos/MedicosPage';
import PacientesPage from './components/pacientes/PacientesPage';
import ConsultasPage from './components/consultas/ConsultasPage';
import ProntuariosPage from './components/prontuarios/ProntuariosPage';
import DashboardPage from './components/dashboard/DashboardPage';
import AssistenteIaPage from './components/assistente-ia/AssistenteIaPage';
import AgendaPage from './components/agenda/AgendaPage';
import PagamentosPage from './components/pagamentos/PagamentosPage';

import RelatorioMinutosPage from './components/relatorios/RelatorioMinutosPage';
import RelatorioPagamentosPage from './components/relatorios/RelatorioPagamentosPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agenda" element={<AgendaPage />} />

        <Route path="/medicos" element={<MedicosPage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/consultas" element={<ConsultasPage />} />
        <Route path="/prontuarios" element={<ProntuariosPage />} />

        <Route path="/pagamentos" element={<PagamentosPage />} />

        <Route path="/relatorios/minutos" element={<RelatorioMinutosPage />} />
        <Route path="/relatorios/pagamentos" element={<RelatorioPagamentosPage />} />

        <Route path="/assistente-ia" element={<AssistenteIaPage />} />
      </Route>
    </Routes>
  );
}

export default App;