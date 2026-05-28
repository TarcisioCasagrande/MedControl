// src/components/agenda/AgendaSlotsLista.jsx
import { CalendarDays, Clock3 } from 'lucide-react';
import {
  classeCardPorStatus,
  corPorStatus,
  formatarStatusCompacto,
} from './utils/agendaStatus';
import { formatarDataInput } from './utils/agendaFormatters';

function AgendaSlotsLista({
  medico,
  dia,
  slots,
  textoVazio,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
}) {
  if (slots.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onAbrirDisponibilidade?.(medico, dia)}
        disabled={!onAbrirDisponibilidade}
        className={`flex min-h-24 w-full max-w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-2 py-3 text-center text-[11px] text-gray-400 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 xl:min-h-28 2xl:min-h-32 2xl:text-xs ${!onAbrirDisponibilidade ? 'cursor-default hover:border-gray-300 hover:bg-white hover:text-gray-400' : ''}` }
        title={onAbrirDisponibilidade ? 'Criar disponibilidade para este médico nesta data' : 'Sem disponibilidade para exibir'}
      >
        <CalendarDays className="mb-2 h-5 w-5" />
        <span className="font-semibold leading-tight">{textoVazio}</span>
        <span className="mt-1 text-[10px] leading-tight">
          {onAbrirDisponibilidade ? 'Clique para criar' : 'Somente leitura'}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-1.5 2xl:space-y-2">
      {slots.map((slot) =>
        slot.agendamento ? (
          <button
            key={`${medico.id}-${formatarDataInput(dia)}-${slot.horario}-agendamento-${slot.agendamento.id}`}
            onClick={() => onAbrirAgendamento(slot.agendamento)}
            className={`w-full max-w-full rounded-lg border p-1.5 text-left shadow-sm transition hover:border-sky-300 2xl:p-3 ${classeCardPorStatus(
              slot.agendamento.status
            )}`}
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-900 2xl:text-xs">
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                {slot.horario}
              </span>

              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white 2xl:px-2 2xl:text-[10px]"
                style={{
                  backgroundColor: corPorStatus(slot.agendamento.status),
                }}
              >
                {formatarStatusCompacto(slot.agendamento.status)}
              </span>
            </div>

            <p className="line-clamp-2 break-words text-[11px] font-bold leading-tight text-gray-900 2xl:text-sm">
              {slot.agendamento.paciente?.nome || 'Paciente'}
            </p>

            <p className="mt-1 line-clamp-2 break-words text-[10px] font-semibold leading-tight text-gray-600 2xl:text-xs">
              {slot.agendamento.procedimento?.nome || 'Sem procedimento informado'}
            </p>

            <p className="mt-1 line-clamp-2 break-words text-[10px] leading-tight text-gray-500 2xl:text-xs">
              {slot.agendamento.motivoAgendamento?.trim()
                ? slot.agendamento.motivoAgendamento
                : 'Motivo não informado'}
            </p>
          </button>
        ) : (
          <button
            key={`${medico.id}-${formatarDataInput(dia)}-${slot.horario}-livre`}
            onClick={() => onAbrirLivre?.(medico, slot.dataHora)}
            disabled={!onAbrirLivre}
            className={`w-full max-w-full rounded-lg border border-dashed border-gray-300 bg-white p-1.5 text-left shadow-sm transition 2xl:p-3 ${onAbrirLivre ? 'hover:border-green-400 hover:bg-green-50' : 'cursor-default opacity-80'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-gray-700">
                <Clock3 className="h-3.5 w-3.5 text-sky-600" />
                {slot.horario}
              </span>

              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                Livre
              </span>
            </div>
          </button>
        )
      )}
    </div>
  );
}

export default AgendaSlotsLista;