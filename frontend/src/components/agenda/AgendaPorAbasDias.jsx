// src/components/agenda/AgendaPorAbasDias.jsx
import AgendaTabelaMedicos from './AgendaTabelaMedicos';
import { formatarDataInput, montarDataDoInput } from './utils/agendaFormatters';

function formatarAbaDia(dia) {
  const numeroDia = String(dia.getDate()).padStart(2, '0');
  const numeroMes = String(dia.getMonth() + 1).padStart(2, '0');

  return `${numeroDia}-${numeroMes}`;
}

function obterDiaSemanaCurto(dia) {
  return dia
    .toLocaleDateString('pt-BR', {
      weekday: 'short',
    })
    .replace('.', '');
}

function somarDias(data, quantidade) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + quantidade);
  return novaData;
}

function gerarDiasEntreDatas(dataInicialTexto, dataFinalTexto) {
  const inicial = montarDataDoInput(dataInicialTexto);
  const final = montarDataDoInput(dataFinalTexto || dataInicialTexto);

  const inicio = inicial <= final ? inicial : final;
  const fim = inicial <= final ? final : inicial;

  const dias = [];
  let atual = new Date(inicio);

  while (atual <= fim) {
    dias.push(new Date(atual));
    atual = somarDias(atual, 1);
  }

  return dias;
}

export default function AgendaPorAbasDias({
  medicos,
  agendamentosFiltrados,
  dataInicial,
  dataFinal,
  dataSelecionada,
  setDataSelecionada,
  disponibilidades,
  statusFiltro,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
}) {
  const dias = gerarDiasEntreDatas(dataInicial, dataFinal);
  const dataSelecionadaObjeto = montarDataDoInput(dataSelecionada);

  const agendamentosDoDia = agendamentosFiltrados.filter(
    (agendamento) => formatarDataInput(agendamento.dataAgendamento) === dataSelecionada
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl bg-white">
      <div className="flex shrink-0 items-end gap-1 overflow-x-auto border-b border-gray-200 bg-gray-100 px-2 pt-2">
        {dias.map((dia) => {
          const diaTexto = formatarDataInput(dia);
          const ativo = diaTexto === dataSelecionada;

          const totalDia = agendamentosFiltrados.filter(
            (agendamento) => formatarDataInput(agendamento.dataAgendamento) === diaTexto
          ).length;

          return (
            <button
              key={diaTexto}
              type="button"
              onClick={() => setDataSelecionada(diaTexto)}
              className={`flex h-11 min-w-[92px] flex-col items-center justify-center rounded-t-lg border px-3 text-xs font-bold transition ${
                ativo
                  ? 'border-sky-400 border-b-white bg-white text-sky-700 shadow-sm'
                  : 'border-gray-200 bg-gray-200 text-gray-600 hover:bg-white hover:text-sky-700'
              }`}
              title={`${totalDia} agendamento(s)`}
            >
              <span className="leading-tight">{formatarAbaDia(dia)}</span>
              <span className="text-[10px] font-semibold leading-tight opacity-80">
                {obterDiaSemanaCurto(dia)}
                {totalDia > 0 ? ` • ${totalDia}` : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white p-2">
        <AgendaTabelaMedicos
          medicos={medicos}
          agendamentosDoDia={agendamentosDoDia}
          dataSelecionada={dataSelecionadaObjeto}
          disponibilidades={disponibilidades}
          statusFiltro={statusFiltro}
          onAbrirAgendamento={onAbrirAgendamento}
          onAbrirLivre={onAbrirLivre}
          onAbrirDisponibilidade={onAbrirDisponibilidade}
        />
      </div>
    </div>
  );
}
