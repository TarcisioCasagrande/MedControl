// src/components/agenda/AgendaPorDias.jsx
import { useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import AgendaSlotsLista from './AgendaSlotsLista';
import { normalizarStatus } from './utils/agendaStatus';
import {
  formatarDataInput,
  formatarDataCurta,
  formatarDiaCabecalho,
  formatarDiaCabecalhoCompacto,
} from './utils/agendaFormatters';
import {
  gerarSlotsDoMedicoPorDia,
  obterDiasDoPeriodo,
  tituloPeriodo,
  obterTemplateColunasAgenda,
  obterLarguraGradeAgenda,
  ehHoje,
} from './utils/agendaSlots';

export default function AgendaPorDias({
  medico,
  agendamentos,
  disponibilidades,
  modoVisualizacao,
  setModoVisualizacao,
  dataReferencia,
  onHoje,
  onVoltar,
  onAvancar,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
  statusFiltro,
}) {
  const dias = useMemo(() => {
    return obterDiasDoPeriodo(dataReferencia, modoVisualizacao);
  }, [dataReferencia, modoVisualizacao]);

  function filtrarSlotsPorStatus(slots) {
    const statusNormalizado = normalizarStatus(statusFiltro);

    if (!statusNormalizado) return slots;

    if (statusNormalizado === 'livre') {
      return slots.filter((slot) => !slot.agendamento);
    }

    return slots.filter(
      (slot) =>
        slot.agendamento &&
        normalizarStatus(slot.agendamento.status) === statusNormalizado
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-gray-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 2xl:px-3 2xl:py-3">
        <div className="flex items-center gap-1.5 xl:gap-2">
          <button
            onClick={onVoltar}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-900 2xl:h-9 2xl:w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={onAvancar}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-900 2xl:h-9 2xl:w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={onHoje}
            className="h-8 rounded-lg bg-slate-600 px-3 text-xs font-semibold text-white hover:bg-slate-700 2xl:h-9 2xl:px-4"
          >
            Hoje
          </button>
        </div>

        <div className="min-w-[220px] flex-1 text-center">
          <h2 className="truncate text-base font-bold text-gray-900 2xl:text-lg">
            {tituloPeriodo(dataReferencia, modoVisualizacao)}
          </h2>
          <p className="truncate text-[11px] text-gray-500 2xl:text-xs">
            {medico.nome} • {medico.especialidade || 'Especialidade não informada'}
          </p>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-slate-800">
          <BotaoModo
            ativo={modoVisualizacao === 'mes'}
            onClick={() => setModoVisualizacao('mes')}
            label="Mensal"
          />
          <BotaoModo
            ativo={modoVisualizacao === 'semana'}
            onClick={() => setModoVisualizacao('semana')}
            label="Semana"
          />
          <BotaoModo
            ativo={modoVisualizacao === 'dia'}
            onClick={() => setModoVisualizacao('dia')}
            label="Dia"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className="flex min-h-full flex-col"
          style={{
            width: obterLarguraGradeAgenda(dias.length, modoVisualizacao),
            minWidth: obterLarguraGradeAgenda(dias.length, modoVisualizacao),
          }}
        >
          <div
            className="sticky top-0 z-20 grid w-full shrink-0 bg-white"
            style={{
              gridTemplateColumns: obterTemplateColunasAgenda(dias.length, modoVisualizacao),
            }}
          >
            {dias.map((dia) => (
              <div
                key={formatarDataInput(dia)}
                className={`border-b border-r border-gray-200 bg-white px-1.5 py-2 2xl:px-2 ${
                  ehHoje(dia) ? 'bg-sky-50' : ''
                }`}
              >
                <div
                  className={`flex min-w-0 ${
                    modoVisualizacao === 'mes'
                      ? 'flex-col items-center justify-center gap-1 text-center'
                      : 'items-center justify-center gap-2 text-center'
                  }`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-lg bg-sky-100 ${
                      modoVisualizacao === 'mes' ? 'h-7 w-7' : 'h-8 w-8'
                    }`}
                  >
                    <CalendarDays
                      className={`text-sky-600 ${
                        modoVisualizacao === 'mes' ? 'h-3.5 w-3.5' : 'h-4 w-4'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`truncate font-bold text-gray-900 ${
                        modoVisualizacao === 'mes' ? 'text-xs' : 'text-sm'
                      }`}
                    >
                      {modoVisualizacao === 'mes'
                        ? formatarDiaCabecalhoCompacto(dia)
                        : formatarDiaCabecalho(dia)}
                    </h3>

                    <p
                      className={`truncate text-gray-500 ${
                        modoVisualizacao === 'mes' ? 'text-[11px]' : 'text-xs'
                      }`}
                    >
                      {ehHoje(dia) ? 'Hoje' : formatarDataCurta(dia)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="grid min-h-0 flex-1 w-full"
            style={{
              gridTemplateColumns: obterTemplateColunasAgenda(dias.length, modoVisualizacao),
            }}
          >
            {dias.map((dia) => {
              const slots = gerarSlotsDoMedicoPorDia(
                medico,
                dia,
                agendamentos,
                disponibilidades
              );

              const slotsFiltrados = filtrarSlotsPorStatus(slots);

              return (
                <div
                  key={formatarDataInput(dia)}
                  className={`min-h-full border-r border-gray-200 p-2 2xl:p-3 ${
                    ehHoje(dia) ? 'bg-sky-50/40' : 'bg-gray-50'
                  }`}
                >
                  <AgendaSlotsLista
                    medico={medico}
                    dia={dia}
                    slots={slotsFiltrados}
                    textoVazio="Nenhuma disponibilidade"
                    onAbrirAgendamento={onAbrirAgendamento}
                    onAbrirLivre={onAbrirLivre}
                    onAbrirDisponibilidade={onAbrirDisponibilidade}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BotaoModo({ ativo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 text-[11px] font-semibold transition 2xl:h-9 2xl:px-4 2xl:text-xs ${
        ativo
          ? 'bg-slate-900 text-white'
          : 'bg-slate-700 text-white hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );
}