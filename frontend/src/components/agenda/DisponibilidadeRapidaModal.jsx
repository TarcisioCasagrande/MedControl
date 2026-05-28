// src/components/agenda/DisponibilidadeRapidaModal.jsx
import { CalendarDays, Save, X } from 'lucide-react';
import {
  formatarDataCurta,
  montarDataDoInput,
} from './utils/agendaFormatters';
import { nomeDiaSemana } from './utils/agendaSlots';

export default function DisponibilidadeRapidaModal({
  isOpen,
  disponibilidade,
  setDisponibilidade,
  salvando,
  onClose,
  onSalvar,
}) {
  if (!isOpen || !disponibilidade) return null;

  function alterarCampo(campo, valor) {
    setDisponibilidade((dados) => ({
      ...dados,
      [campo]: valor,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!disponibilidade.horaInicio || !disponibilidade.horaFim) {
      return;
    }

    if (disponibilidade.horaInicio >= disponibilidade.horaFim) {
      alert('A hora inicial precisa ser menor que a hora final.');
      return;
    }

    onSalvar(disponibilidade);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Nova disponibilidade</h2>
              <p className="text-xs text-sky-100">
                Crie a disponibilidade sem sair da agenda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto bg-gray-50 p-5">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                Dados principais
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CampoResumo
                  label="Médico"
                  valor={disponibilidade.medicoNome || '-'}
                />

                <CampoResumo
                  label="Data"
                  valor={`${formatarDataCurta(montarDataDoInput(disponibilidade.dataInicio))} · ${nomeDiaSemana(disponibilidade.diasSemana?.[0])}`}
                />

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Hora início
                  </label>
                  <input
                    type="time"
                    value={disponibilidade.horaInicio}
                    onChange={(e) => alterarCampo('horaInicio', e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Hora fim
                  </label>
                  <input
                    type="time"
                    value={disponibilidade.horaFim}
                    onChange={(e) => alterarCampo('horaFim', e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Intervalo em minutos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={disponibilidade.intervaloMinutos}
                    onChange={(e) =>
                      alterarCampo('intervaloMinutos', e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={disponibilidade.ativo}
                    onChange={(e) => alterarCampo('ativo', e.target.checked)}
                    className="accent-sky-600"
                  />
                  Disponibilidade ativa
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-800">
              Esta disponibilidade será criada apenas para o dia selecionado na
              agenda. Depois de salvar, os horários livres aparecerão
              automaticamente.
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex h-10 items-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {salvando ? 'Salvando...' : 'Salvar disponibilidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoResumo({ label, valor }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-800">
        {valor}
      </div>
    </div>
  );
}