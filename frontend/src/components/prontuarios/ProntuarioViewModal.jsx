import {
  X,
  FileText,
  ClipboardList,
  Stethoscope,
  Activity,
  Pill,
  FlaskConical,
  MessageSquareText,
  CalendarDays,
  UserRound,
  BadgeCheck,
} from 'lucide-react';

function ProntuarioViewModal({ isOpen, onClose, prontuario }) {
  if (!isOpen || !prontuario) return null;

  function formatarData(data) {
    if (!data) return '-';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="flex max-h-[96vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-sky-600 px-6 py-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black">Visualizar prontuário</h2>
              <p className="text-xs text-sky-100">Prontuário #{prontuario.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <InfoBox
              icon={UserRound}
              titulo="Paciente"
              valor={prontuario.agendamento?.paciente?.nome || 'Não informado'}
            />

            <InfoBox
              icon={Stethoscope}
              titulo="Médico"
              valor={prontuario.agendamento?.medico?.nome || 'Não informado'}
            />

            <InfoBox
              icon={CalendarDays}
              titulo="Data do atendimento"
              valor={formatarData(prontuario.agendamento?.dataAgendamento)}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <MiniInfo
              icon={ClipboardList}
              titulo="Agendamento"
              valor={prontuario.agendamentoId ? `#${prontuario.agendamentoId}` : '-'}
              cor="blue"
            />

            <MiniInfo
              icon={Stethoscope}
              titulo="Diagnóstico"
              valor={prontuario.diagnostico ? 'Preenchido' : 'Não informado'}
              cor="green"
            />

            <MiniInfo
              icon={Pill}
              titulo="Prescrição"
              valor={prontuario.prescricao || prontuario.receita ? 'Preenchida' : 'Não informado'}
              cor="violet"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <TextoCard
              icon={Activity}
              titulo="Queixa principal"
              valor={prontuario.queixaPrincipal}
            />

            <TextoCard
              icon={ClipboardList}
              titulo="Histórico clínico"
              valor={prontuario.historicoClinico}
            />

            <TextoCard
              icon={Stethoscope}
              titulo="Diagnóstico"
              valor={prontuario.diagnostico}
            />

            <TextoCard
              icon={Activity}
              titulo="Conduta"
              valor={prontuario.conduta}
            />

            <TextoCard
              icon={Pill}
              titulo="Prescrição / Receita"
              valor={prontuario.prescricao || prontuario.receita}
            />

            <TextoCard
              icon={FlaskConical}
              titulo="Exames solicitados"
              valor={prontuario.examesSolicitados}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <TextoCard
              icon={MessageSquareText}
              titulo="Observações"
              valor={prontuario.observacoes}
              grande
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, titulo, valor }) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-sky-600" />
        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
          {titulo}
        </p>
      </div>

      <p className="break-words text-sm font-black leading-snug text-gray-900">
        {valor || 'Não informado'}
      </p>
    </section>
  );
}

function MiniInfo({ icon: Icon, titulo, valor, cor }) {
  const cores = {
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  };

  return (
    <div className={`min-w-0 rounded-2xl border px-4 py-3 shadow-sm ${cores[cor]}`}>
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide">{titulo}</p>
          <p className="truncate text-xs font-bold">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function TextoCard({ icon: Icon, titulo, valor, grande = false }) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-sky-600" />

        <h3 className="truncate text-sm font-black text-gray-900">{titulo}</h3>
      </div>

      <div
        className={`overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 ${
          grande ? 'min-h-[110px]' : 'min-h-[150px] max-h-[220px] overflow-y-auto'
        }`}
      >
        {valor || 'Nenhuma informação registrada.'}
      </div>
    </section>
  );
}

export default ProntuarioViewModal;