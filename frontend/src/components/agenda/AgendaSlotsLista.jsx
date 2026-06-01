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
        className={`flex min-h-20 w-full max-w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-2 py-2 text-center text-[10px] text-gray-400 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 ${
          !onAbrirDisponibilidade
            ? 'cursor-default hover:border-gray-300 hover:bg-white hover:text-gray-400'
            : ''
        }`}
      >
        <CalendarDays className="mb-1 h-4 w-4" />
        <span className="font-semibold leading-tight">{textoVazio}</span>
        <span className="mt-0.5 text-[9px] leading-tight">
          {onAbrirDisponibilidade ? 'Clique para criar' : 'Somente leitura'}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-1 pb-4">
      {slots.map((slot) =>
        slot.agendamento ? (
          <button
            key={`${medico.id}-${formatarDataInput(dia)}-${slot.horario}-agendamento-${slot.agendamento.id}`}
            onClick={() => onAbrirAgendamento(slot.agendamento)}
            className={`w-full max-w-full min-h-[110px] rounded-lg border p-3 text-left shadow-sm transition hover:border-sky-300 ${classeCardPorStatus(
              slot.agendamento.status
            )}`}
          >
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                <Clock3 className="h-3 w-3 shrink-0 text-sky-600" />
                {slot.horario}
              </span>

              <span
                className="rounded-full px-2 py-0.5 text-[12px] font-bold text-white"
                style={{ backgroundColor: corPorStatus(slot.agendamento.status) }}
              >
                {formatarStatusCompacto(slot.agendamento.status)}
              </span>
            </div>

            <p className="line-clamp-1 break-words text-[16px] font-black leading-tight text-gray-900">
              {slot.agendamento.paciente?.nome ||
                slot.agendamento.pacienteNome ||
                'Paciente'}
            </p>

            <p className="text-[11px] font-semibold text-green-700">
                Valor:{' '}
                {Number(
                  slot.agendamento.valorCobrado ||
                  slot.agendamento.procedimento?.valor ||
                  0
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
            </p>

            <p className="mt-0.5 line-clamp-1 break-words text-[12px] font-semibold leading-tight text-gray-600">
              <b>Procedimento: </b>
              {slot.agendamento.procedimento?.nome ||
                slot.agendamento.procedimentoNome ||
                'Sem procedimento informado'}
            </p>

            <p className="mt-0.5 line-clamp-1 break-words text-[12px] leading-tight text-gray-500">
              <b>Motivo: </b>
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
            className={`w-full max-w-full rounded-lg border border-dashed border-gray-300 bg-white p-3 text-left shadow-sm transition ${
              onAbrirLivre
                ? 'hover:border-green-400 hover:bg-green-50'
                : 'cursor-default opacity-80'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                <Clock3 className="h-3 w-3 text-sky-600" />
                {slot.horario}
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-[12px] font-bold text-green-700">
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
