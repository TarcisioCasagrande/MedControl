// src/components/agenda/AgendaResumoCards.jsx
import { normalizarStatus } from './utils/agendaStatus';

function AgendaResumoCards({
  medicoFiltro,
  agendamentosExibidosMedico,
  agendamentosDoDiaTodosMedicos,
}) {
  const agendamentosBase = medicoFiltro
    ? agendamentosExibidosMedico
    : agendamentosDoDiaTodosMedicos;

  const aguardandoRecepcao = agendamentosBase.filter((agendamento) => {
    const status = normalizarStatus(agendamento.status);
    return status === 'agendado' || status === 'agendada';
  }).length;

  const recepcionados = agendamentosBase.filter((agendamento) => {
    const status = normalizarStatus(agendamento.status);

    return (
      status === 'atendidorecepcao' ||
      status === 'atendido' ||
      status === 'atendida' ||
      status === 'emandamento' ||
      status === 'ematendimentomedico' ||
      status === 'finalizado' ||
      status === 'finalizada'
    );
  }).length;

  const emAtendimento = agendamentosBase.filter((agendamento) => {
    const status = normalizarStatus(agendamento.status);
    return status === 'emandamento' || status === 'ematendimentomedico';
  }).length;

  const faturamentoPrevisto = agendamentosBase.reduce((total, agendamento) => {
    const valor =
      Number(agendamento.valorCobrado) ||
      Number(agendamento.procedimento?.valor) ||
      Number(agendamento.procedimentoValor) ||
      0;

    return total + valor;
  }, 0);

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      <ResumoTopo
        label={medicoFiltro ? 'Agendamentos exibidos' : 'Agenda do dia'}
        valor={agendamentosBase.length}
      />

      <ResumoTopo
        label="Aguardando recepção"
        valor={aguardandoRecepcao}
      />

      <ResumoTopo
        label="Liberados para o Médico"
        valor={recepcionados}
      />

      <ResumoTopo
        label="Faturamento previsto"
        valor={formatarMoeda(faturamentoPrevisto)}
      />
    </div>
  );
}

function ResumoTopo({ label, valor }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-black text-gray-900">
        {valor}
      </p>
    </div>
  );
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default AgendaResumoCards;