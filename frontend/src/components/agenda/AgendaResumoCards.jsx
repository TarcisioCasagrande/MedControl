// src/components/agenda/AgendaResumoCards.jsx
import { normalizarStatus } from './utils/agendaStatus';
import { montarDataDoInput } from './utils/agendaFormatters';
import {
  gerarSlotsDoMedicoPorDia,
  obterDiasDoPeriodo,
} from './utils/agendaSlots';

function AgendaResumoCards({
  medicoFiltro,
  agendamentosExibidosMedico,
  agendamentosDoDiaTodosMedicos,
  agendamentos,
  medicosVisiveis,
  disponibilidades,
  modoVisualizacao,
  dataReferencia,
  dataInicialTodosMedicos,
  dataFinalTodosMedicos,
}) {
  const agendamentosBase = medicoFiltro
    ? agendamentosExibidosMedico
    : agendamentosDoDiaTodosMedicos;

  const aguardandoRecepcao = agendamentosBase.filter((agendamento) => {
    const status = normalizarStatus(agendamento.status);
    return status === 'agendado' || status === 'agendada';
  }).length;

  const liberadosParaMedico = agendamentosBase.filter((agendamento) => {
    const status = normalizarStatus(agendamento.status);

    return (
      status === 'atendidorecepcao' ||
      status === 'atendido' ||
      status === 'atendida'
    );
  }).length;

  const horariosLivres = calcularHorariosLivres({
    medicoFiltro,
    agendamentos,
    medicosVisiveis,
    disponibilidades,
    modoVisualizacao,
    dataReferencia,
    dataInicialTodosMedicos,
    dataFinalTodosMedicos,
  });

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
        label="Liberados para o médico"
        valor={liberadosParaMedico}
      />

      <ResumoTopo
        label="Horários livres"
        valor={horariosLivres}
      />
    </div>
  );
}

function calcularHorariosLivres({
  medicoFiltro,
  agendamentos,
  medicosVisiveis,
  disponibilidades,
  modoVisualizacao,
  dataReferencia,
  dataInicialTodosMedicos,
  dataFinalTodosMedicos,
}) {
  const medicosParaCalculo = medicoFiltro
    ? medicosVisiveis.filter((medico) => String(medico.id) === String(medicoFiltro))
    : medicosVisiveis;

  const diasParaCalculo = medicoFiltro
    ? obterDiasDoPeriodo(dataReferencia, modoVisualizacao)
    : gerarDiasEntreDatas(dataInicialTodosMedicos, dataFinalTodosMedicos);

  let totalLivres = 0;

  diasParaCalculo.forEach((dia) => {
    medicosParaCalculo.forEach((medico) => {
      const slots = gerarSlotsDoMedicoPorDia(
        medico,
        dia,
        agendamentos,
        disponibilidades
      );

      totalLivres += slots.filter((slot) => !slot.agendamento).length;
    });
  });

  return totalLivres;
}

function gerarDiasEntreDatas(dataInicialTexto, dataFinalTexto) {
  if (!dataInicialTexto || !dataFinalTexto) return [];

  const inicial = montarDataDoInput(dataInicialTexto);
  const final = montarDataDoInput(dataFinalTexto);

  const inicio = inicial <= final ? inicial : final;
  const fim = inicial <= final ? final : inicial;

  const dias = [];
  let atual = new Date(inicio);

  while (atual <= fim) {
    dias.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
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

export default AgendaResumoCards;
