// src/components/agenda/AgendaTabelaMedicos.jsx
import { CalendarDays, Stethoscope } from 'lucide-react';
import AgendaSlotsLista from './AgendaSlotsLista';
import { formatarDataLonga } from './utils/agendaFormatters';
import {
  disponibilidadeValeParaData,
  gerarSlotsDoMedicoPorDia,
  obterTemplateColunasTodosMedicos,
} from './utils/agendaSlots';

export default function AgendaTabelaMedicos({
  medicos,
  agendamentosDoDia,
  dataSelecionada,
  disponibilidades,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
}) {
  const medicosComAgenda = medicos.filter((medico) => {
    const temAgendamento = agendamentosDoDia.some(
      (agendamento) =>
        String(agendamento.medicoId ?? agendamento.medico?.id) === String(medico.id)
    );

    const temDisponibilidade = disponibilidades.some((item) =>
      disponibilidadeValeParaData(item, medico.id, dataSelecionada)
    );

    return temAgendamento || temDisponibilidade;
  });

  const listaMedicos = medicosComAgenda.length > 0 ? medicosComAgenda : medicos;
  const totalColunas = Math.max(listaMedicos.length, 1);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-gray-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 xl:px-3 xl:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 2xl:h-9 2xl:w-9">
            <CalendarDays className="h-4 w-4 text-sky-600" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-gray-900 2xl:text-lg">Todos os médicos</h2>
            <p className="truncate text-[11px] text-gray-500 2xl:text-xs">
              {formatarDataLonga(dataSelecionada)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-sky-50 px-2 py-1.5 text-right xl:px-3 xl:py-2">
          <p className="text-[11px] font-semibold uppercase text-sky-600">
            Agendamentos no dia
          </p>
          <p className="text-sm font-bold text-gray-900">
            {agendamentosDoDia.length}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        {listaMedicos.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Nenhum médico cadastrado.
          </div>
        ) : (
          <>
            <div
              className="sticky top-0 z-10 grid w-full bg-white shadow-sm"
              style={{
                gridTemplateColumns: obterTemplateColunasTodosMedicos(totalColunas),
              }}
            >
              {listaMedicos.map((medico) => (
                <div
                  key={medico.id}
                  className="border-b border-r border-gray-200 px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                      <Stethoscope className="h-4 w-4 text-sky-600" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {medico.nome}
                      </h3>
                      <p className="truncate text-xs text-gray-500">
                        {medico.especialidade || 'Especialidade não informada'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="grid w-full"
              style={{
                gridTemplateColumns: obterTemplateColunasTodosMedicos(totalColunas),
              }}
            >
              {listaMedicos.map((medico) => {
                const slots = gerarSlotsDoMedicoPorDia(
                  medico,
                  dataSelecionada,
                  agendamentosDoDia,
                  disponibilidades
                );

                return (
                  <div
                    key={medico.id}
                    className="min-h-full border-r border-gray-200 bg-gray-50 p-2 2xl:p-3"
                  >
                    <AgendaSlotsLista
                      medico={medico}
                      dia={dataSelecionada}
                      slots={slots}
                      textoVazio="Nenhuma disponibilidade neste dia"
                      onAbrirAgendamento={onAbrirAgendamento}
                      onAbrirLivre={onAbrirLivre}
                      onAbrirDisponibilidade={onAbrirDisponibilidade}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}